/**
 * Recommendation Service — Hybrid ML Pipeline (K-means + TF-IDF + CF + Popularity)
 * ---------------------------------------------------------------------------------
 * Architecture:
 *   PRIMARY   — Python ML microservice (FastAPI + scikit-learn)
 *               K-means clustering on TF-IDF vectors, cosine similarity,
 *               Item-Item Jaccard CF, popularity prior.
 *   FALLBACK  — Node.js BM25 + Jaccard + Popularity (existing logic)
 *               Used when the Python service is unreachable or not trained.
 *
 * Pipeline (via Python ML service):
 *   1. Node.js sends userId + top_k to Python service
 *   2. Python loads user signals from MongoDB, builds weighted profile
 *   3. Python scores candidates using trained K-means model + content + CF + popularity
 *   4. Returns ranked courseIds + scores
 *   5. Node.js maps IDs back to full course documents for the API response
 *
 * Fallback pipeline (Node.js, same as before):
 *   1–7. BM25-cosine + Jaccard CF + Popularity + MMR diversity
 */

import AppError from "#exceptions/app.error.js";
import Course, { STATUS_ENUM as COURSE_STATUS } from "#modules/course/course.model.js";
import Enrollment, { STATUS_ENUM as ENROLL_STATUS } from "#modules/enrollment/enrollment.model.js";
import Review from "#modules/review/review.model.js";
import User from "#modules/user/user.model.js";
import Wishlist from "#modules/wishlist/wishlist.model.js";
import RecommendationModel, { REC_MODEL_KINDS } from "#services/recommendationModel.model.js";
import {
  buildItemItemMatrix,
  cosineRank,
  getRecommendations
} from "#utils/recommendationEngine.js";

// ---- Python ML service config -----------------------------------------------
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5002";
const ML_TIMEOUT_MS = parseInt(process.env.ML_TIMEOUT_MS || "3000", 10);

const publicFilter = {
  isPrivate: false, isDeleted: false, status: COURSE_STATUS.live
};

// ---- Hybrid scoring weights -------------------------------------------------
// Tuned for cold-start friendliness: content carries the most weight because
// it is the only signal available for new users. CF dominates as soon as the
// user has ≥2 enrollments. Popularity is a small prior to break ties.
const W_CONTENT = 0.55;
const W_CF = 0.35;
const W_POPULARITY = 0.10;

// MMR diversity: λ=1 ⇒ pure relevance, λ=0 ⇒ pure diversity.
const MMR_LAMBDA = 0.75;

// Action weights for the user profile. Repetition in the profile text bumps
// term frequencies, indirectly emphasising those tags/titles in BM25 scoring.
const ACTION_WEIGHT = {
  completed: 3,   // strongest signal — student finished the course
  active: 2,   // mid signal — still learning
  wishlist: 1,   // weak signal — interested but not committed
  interest: 1,   // registration-time interest tag
};

// Rating-derived modifier for enrollment weight: a 5★ review amplifies, 1★ shrinks.
// Returns a multiplier in [0, 2]. Rating == 3 (neutral) leaves weight unchanged.
const ratingMultiplier = (rating) => {
  if (!rating || rating < 1) return 1;
  return Math.max(0, Math.min(2, 1 + (rating - 3) * 0.5));
};

// =============================================================================
// MAIN ENTRY — used by course.controller.js (signature unchanged)
// =============================================================================
export const getRecommendedCourses = async (
  userId, recommendedSize = 8, candidatesLimit = 100
) => {
  if (!userId) return {
    courses: await getBestSellers(publicFilter, recommendedSize),
    debugSource: "Fallback(BestSellers)"
  };

  // ── Try Python ML service first ──────────────────────────────────────────
  try {
    const mlResult = await getRecommendationsFromMLService(userId, recommendedSize);
    if (mlResult) return mlResult;
  } catch (err) {
    console.warn("[recommendation] ML service unavailable, falling back to Node.js:", err.message);
  }

  // ── Fallback: Node.js BM25 + Jaccard + Popularity ───────────────────────
  return getRecommendedCoursesNodeFallback(userId, recommendedSize, candidatesLimit);
};

// =============================================================================
// PRIMARY — Python ML Service (K-means + TF-IDF + CF + Popularity)
// =============================================================================
const getRecommendationsFromMLService = async (userId, topK) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ML_TIMEOUT_MS);

  try {
    const response = await fetch(`${ML_SERVICE_URL}/api/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: String(userId), top_k: topK }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`ML service returned ${response.status}: ${text}`);
    }

    const data = await response.json();

    // If ML service has no signals or no model, return null to trigger fallback
    if (!data.recommendations || data.recommendations.length === 0) {
      if (data.debug_source === "NoSignals") {
        return {
          courses: await getBestSellers(publicFilter, topK),
          debugSource: "Fallback(BestSellers)"
        };
      }
      return null;
    }

    // Map ML service courseIds back to full Mongoose documents
    const courseIds = data.recommendations.map(r => r.courseId);
    const courses = await Course.find({ _id: { $in: courseIds } })
      .populate("category", "name slug")
      .lean();

    // Preserve the ML service's ordering and attach scores
    const courseMap = new Map(courses.map(c => [String(c._id), c]));
    const orderedCourses = data.recommendations
      .map(r => {
        const course = courseMap.get(r.courseId);
        if (!course) return null;
        return { ...course, similarityScore: r.score };
      })
      .filter(Boolean);

    if (orderedCourses.length === 0) return null;

    return {
      courses: orderedCourses,
      debugSource: `ML(${data.debug_source || "KMeans+TF-IDF"})`,
    };
  } finally {
    clearTimeout(timeout);
  }
};

// =============================================================================
// FALLBACK — Node.js BM25 + Jaccard + Popularity (existing logic)
// =============================================================================
const getRecommendedCoursesNodeFallback = async (
  userId, recommendedSize = 8, candidatesLimit = 100
) => {
  if (!userId) return {
    courses: await getBestSellers(publicFilter, recommendedSize),
    debugSource: "Fallback(BestSellers)"
  };

  const commonPopulate = {
    path: "course",
    select: "title subtitle tags category",
    populate: { path: "category", select: "name" }
  };

  // 1. Pull all user signals in parallel.
  const [enrollments, wishlist, reviews, user] = await Promise.all([
    Enrollment.find({ student: userId }).populate(commonPopulate).lean(),
    Wishlist.find({ user: userId }).populate(commonPopulate).lean(),
    Review.find({ user: userId, isDeleted: false }).select("course rating").lean(),
    User.findById(userId).select("interests").lean()
  ]);

  const reviewByCourse = new Map(
    reviews.map(r => [String(r.course), r.rating])
  );

  // 2. Aggregate signals into weighted entries: { course, weight }.
  const weightedHistory = [];
  for (const e of enrollments) {
    if (!e.course) continue;
    const baseWeight = e.status === ENROLL_STATUS.completed
      ? ACTION_WEIGHT.completed
      : e.status === ENROLL_STATUS.active
        ? ACTION_WEIGHT.active
        : 0;
    if (baseWeight === 0) continue;
    const rating = reviewByCourse.get(String(e.course._id));
    weightedHistory.push({ course: e.course, weight: baseWeight * ratingMultiplier(rating) });
  }
  for (const w of wishlist) {
    if (!w.course) continue;
    weightedHistory.push({ course: w.course, weight: ACTION_WEIGHT.wishlist });
  }

  // Track which course IDs the user already actively owns — exclude from recs.
  const purchasedIds = enrollments
    .filter(e => e.status === ENROLL_STATUS.active || e.status === ENROLL_STATUS.completed)
    .map(e => e.course?._id?.toString())
    .filter(Boolean);

  const userInterests = (user?.interests || []).filter(Boolean);

  // Cold-start: zero signals at all → bestsellers.
  if (weightedHistory.length === 0 && userInterests.length === 0) {
    return {
      courses: await getBestSellers(publicFilter, recommendedSize),
      debugSource: "Fallback(BestSellers)"
    };
  }

  // 3. Build the rating-weighted user profile text used by the content arm.
  const userProfileText = buildUserProfileText(weightedHistory, userInterests);

  // 4. Pull candidate pool. We always populate category for the mapper later.
  const candidates = await Course.find({
    ...publicFilter,
    _id: { $nin: purchasedIds }
  })
    .populate("category", "name slug")
    .limit(candidatesLimit)
    .lean();

  if (candidates.length === 0) {
    return {
      courses: await getBestSellers(publicFilter, recommendedSize),
      debugSource: "Fallback(BestSellers)"
    };
  }

  // 5a. Content scores (BM25 + cosine).
  const contentScores = new Map();
  const contentRanked = cosineRank(userProfileText, candidates, candidates.length);
  for (const { doc, score } of contentRanked) {
    contentScores.set(String(doc._id), score);
  }

  // 5b. CF scores (item-item Jaccard sum over the user's interacted items).
  const cfScores = await scoreByItemItemCf(weightedHistory, candidates);

  // 5c. Popularity prior.
  const popScores = new Map(
    candidates.map(c => [String(c._id), Math.log((c.studentsEnrolled || 0) + 1)])
  );

  // 6. Min-max normalize each signal to [0,1] so the weights are comparable.
  const norm = (m) => {
    const vals = [...m.values()];
    if (vals.length === 0) return m;
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    const span = max - min;
    if (span === 0) {
      const out = new Map();
      for (const k of m.keys()) out.set(k, max > 0 ? 1 : 0);
      return out;
    }
    const out = new Map();
    for (const [k, v] of m.entries()) out.set(k, (v - min) / span);
    return out;
  };
  const nContent = norm(contentScores);
  const nCf = norm(cfScores);
  const nPop = norm(popScores);

  const fused = candidates.map(c => {
    const id = String(c._id);
    const score =
      W_CONTENT * (nContent.get(id) || 0) +
      W_CF * (nCf.get(id) || 0) +
      W_POPULARITY * (nPop.get(id) || 0);
    return { doc: c, score };
  }).filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);

  // 7. MMR re-rank for diversity (avoid 8 near-duplicate courses).
  const diversified = mmrRerank(fused, recommendedSize, MMR_LAMBDA);

  if (diversified.length === 0) {
    return {
      courses: await getBestSellers(publicFilter, recommendedSize),
      debugSource: "Fallback(BestSellers)"
    };
  }

  const finalCourses = diversified.map(x => ({ ...x.doc, similarityScore: x.score }));

  // Compose a debug label that surfaces which arms actually contributed.
  const usedContent = [...nContent.values()].some(v => v > 0);
  const usedCf = [...nCf.values()].some(v => v > 0);
  const debugSource = `Hybrid(${[
    usedContent ? "Content(BM25)" : null,
    usedCf ? "ItemCF(Jaccard)" : null,
    "Popularity"
  ].filter(Boolean).join("+")})`;

  return { courses: finalCourses, debugSource };
};

// =============================================================================
// Helpers
// =============================================================================

/**
 * Build the searchable text representing the user's taste.
 * Repeats each course's title/tags by its weight so that BM25 sees a higher
 * term frequency for the courses the user values most. Interests are added
 * once each (weak signal).
 */
const buildUserProfileText = (weightedHistory, interests) => {
  const parts = [];
  for (const { course, weight } of weightedHistory) {
    const block = [
      course.title || "",
      course.subtitle || "",
      (course.tags || []).join(" "),
      course.category?.name || ""
    ].join(" ");
    const reps = Math.max(1, Math.round(weight));
    for (let i = 0; i < reps; i++) parts.push(block);
  }
  for (const i of interests) parts.push(String(i));
  return parts.join(" ");
};

/**
 * Score candidates with item-item collaborative filtering.
 * For each candidate c, score(c) = Σ_{h ∈ history} weight(h) · sim(h, c).
 * The matrix is loaded from cache; if absent we build it from the DB
 * (still <100 ms at our scale).
 */
const scoreByItemItemCf = async (weightedHistory, candidates) => {
  const out = new Map(candidates.map(c => [String(c._id), 0]));
  if (weightedHistory.length === 0) return out;

  const matrix = await loadOrBuildItemItemMatrix();
  if (!matrix || Object.keys(matrix).length === 0) return out;

  for (const { course, weight } of weightedHistory) {
    const row = matrix[String(course._id)];
    if (!row) continue;
    for (const c of candidates) {
      const sim = row[String(c._id)];
      if (sim) out.set(String(c._id), out.get(String(c._id)) + weight * sim);
    }
  }
  return out;
};

/**
 * Load the cached item-item matrix; rebuild from the DB if missing.
 * The cached version is refreshed by scripts/trainRecommender.mjs.
 */
const loadOrBuildItemItemMatrix = async () => {
  const cached = await RecommendationModel
    .findOne({ kind: REC_MODEL_KINDS.itemItem })
    .lean();
  if (cached?.payload?.matrix) return cached.payload.matrix;

  // Safety net: build live from the DB.
  const [enrollments, wishlist, reviews] = await Promise.all([
    Enrollment.find({}).select("student course status").lean(),
    Wishlist.find({}).select("user course").lean(),
    Review.find({ isDeleted: false }).select("user course").lean()
  ]);
  const interactions = [
    ...enrollments
      .filter(e => e.status !== ENROLL_STATUS.refunded && e.status !== ENROLL_STATUS.inactive)
      .map(e => ({ userId: e.student, courseId: e.course })),
    ...wishlist.map(w => ({ userId: w.user, courseId: w.course })),
    ...reviews.map(r => ({ userId: r.user, courseId: r.course }))
  ];
  const built = buildItemItemMatrix(interactions);
  return built.matrix;
};

/**
 * Maximal Marginal Relevance re-rank.
 * Picks items one at a time, balancing relevance against similarity to items
 * already chosen. Similarity proxy here is "shares a category or any tag".
 *   MMR(c) = λ·rel(c) − (1-λ)·max_{s∈selected} sim(c, s)
 */
const mmrRerank = (candidates, k, lambda = 0.75) => {
  const selected = [];
  const pool = [...candidates];

  const proxySim = (a, b) => {
    if (!a?.doc || !b?.doc) return 0;
    const sameCat = a.doc.category?._id?.toString?.() === b.doc.category?._id?.toString?.();
    const tagsA = new Set(a.doc.tags || []);
    const tagOverlap = (b.doc.tags || []).some(t => tagsA.has(t));
    if (sameCat && tagOverlap) return 1.0;
    if (sameCat) return 0.6;
    if (tagOverlap) return 0.5;
    return 0;
  };

  while (selected.length < k && pool.length > 0) {
    let bestIdx = 0;
    let bestScore = -Infinity;
    for (let i = 0; i < pool.length; i++) {
      const cand = pool[i];
      const maxSim = selected.length === 0
        ? 0
        : Math.max(...selected.map(s => proxySim(cand, s)));
      const mmr = lambda * cand.score - (1 - lambda) * maxSim;
      if (mmr > bestScore) { bestScore = mmr; bestIdx = i; }
    }
    selected.push(pool.splice(bestIdx, 1)[0]);
  }
  return selected;
};


const getBestSellers = async (filter, recommendedSize = 8) => {
  return await Course.find({ ...filter })
    .populate("category", "name slug")
    .sort({ studentsEnrolled: -1, createdAt: -1 })
    .limit(recommendedSize)
    .lean();
};

export const getRelatedCourses = async (
  courseId, relatedSize = 5, candidatesLimit = 100
) => {
  if (!courseId) throw new AppError("Course ID is required.", 400);

  const current = await Course.findOne({
    _id: courseId,
    isDeleted: false,
  }).select("title subtitle tags category")
    .populate("category", "name")
    .lean();
  if (!current) throw new AppError("Course not found.", 404);

  const baseFilter = { ...publicFilter, _id: { $ne: current._id } };

  const candidates = await Course.find({
    ...baseFilter,
    $or: [
      { category: current.category?._id },
      { tags: { $in: current.tags || [] } }
    ]
  }).populate("category", "name slug")
    .limit(candidatesLimit)
    .lean();

  const targetProfile = {
    title: current.title || '',
    subtitle: current.subtitle || '',
    tag: (current.tags || []).join(' ') || '',
    category: current.category?.name || ''
  };

  let related = getRecommendations(targetProfile, candidates, relatedSize);
  let source = "TF-IDF(ContentSimilarity)";

  if (related.length === 0 && current.category) {
    related = await Course.find({ ...baseFilter, category: current.category._id })
      .sort({ studentsEnrolled: -1 })
      .limit(relatedSize)
      .lean();
    source = "Fallback(SameCategory)";
  }

  if (related.length === 0) {
    related = await Course.find({ ...baseFilter })
      .sort({ studentsEnrolled: -1 })
      .limit(relatedSize)
      .lean();
    source = "Fallback(GlobalBestSellers)";
  }

  return { courses: related, debugSource: source };
};