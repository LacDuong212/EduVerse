/**
 * Trainer for the recommendation system.
 *
 * Usage:
 *   node scripts/trainRecommender.mjs            # one-shot rebuild + exit
 *   node scripts/trainRecommender.mjs --watch    # rebuild every 30 min via node-cron
 *
 * What it does:
 *   1. Pulls every user-course interaction from Enrollments, Wishlist, Reviews.
 *   2. Builds an item-item Jaccard similarity matrix.
 *   3. Upserts the matrix into the `recommendationmodels` collection
 *      (one document per kind, see RecommendationModel).
 *
 * The runtime service (recommendation.service.js) loads this matrix on every
 * recommendation request. If it is missing the service falls back to building
 * the matrix on the fly (slower but always correct).
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import cron from "node-cron";

dotenv.config();

// Resolve the package-relative #aliases that the rest of the codebase uses.
const { default: Enrollment, STATUS_ENUM: ENROLL_STATUS } =
  await import("#modules/enrollment/enrollment.model.js");
const { default: Wishlist } = await import("#modules/wishlist/wishlist.model.js");
const { default: Review }   = await import("#modules/review/review.model.js");
const { default: RecommendationModel, REC_MODEL_KINDS } =
  await import("#services/recommendationModel.model.js");
const { buildItemItemMatrix } = await import("#utils/recommendationEngine.js");

const log  = (...a) => console.log("[trainRecommender]", ...a);

const train = async () => {
  const startedAt = Date.now();

  const [enrollments, wishlist, reviews] = await Promise.all([
    Enrollment.find({}).select("student course status").lean(),
    Wishlist.find({}).select("user course").lean(),
    Review.find({ isDeleted: false }).select("user course").lean()
  ]);

  // Exclude refunded / inactive enrollments — they are noise, not signal.
  const interactions = [
    ...enrollments
      .filter(e => e.status !== ENROLL_STATUS.refunded && e.status !== ENROLL_STATUS.inactive)
      .map(e => ({ userId: e.student, courseId: e.course })),
    ...wishlist.map(w => ({ userId: w.user, courseId: w.course })),
    ...reviews.map(r => ({ userId: r.user, courseId: r.course }))
  ];

  const built = buildItemItemMatrix(interactions);

  await RecommendationModel.findOneAndUpdate(
    { kind: REC_MODEL_KINDS.itemItem },
    {
      kind: REC_MODEL_KINDS.itemItem,
      payload: built,
      stats: {
        interactions: interactions.length,
        items: Object.keys(built.matrix).length,
        nonZeroPairs: Object.values(built.matrix)
          .reduce((acc, row) => acc + Object.keys(row).length, 0)
      },
      builtAt: built.builtAt
    },
    { upsert: true, new: true }
  );

  log(
    `done in ${Date.now() - startedAt} ms`,
    `| items=${Object.keys(built.matrix).length}`,
    `| interactions=${interactions.length}`
  );
};

const main = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set. Aborting.");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  log("connected to MongoDB");

  await train();

  if (process.argv.includes("--watch")) {
    // Every 30 minutes. Adjust via REC_TRAIN_CRON env var if needed.
    const expr = process.env.REC_TRAIN_CRON || "*/30 * * * *";
    log(`watching with cron expression "${expr}"`);
    cron.schedule(expr, () => {
      train().catch(err => console.error("[trainRecommender] failed:", err));
    });
  } else {
    await mongoose.disconnect();
    process.exit(0);
  }
};

main().catch(err => {
  console.error(err);
  process.exit(1);
});
