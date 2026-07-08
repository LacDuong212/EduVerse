import AppError from "#exceptions/app.error.js";
import Course, { STATUS_ENUM as COURSE_STATUS } from "#modules/course/course.model.js";
import Enrollment, { STATUS_ENUM as ENROLL_STATUS } from "#modules/enrollment/enrollment.model.js";
import Review from "#modules/review/review.model.js";
import User from "#modules/user/user.model.js";
import Wishlist from "#modules/wishlist/wishlist.model.js";
import logger from "#utils/logger.js";
import {
  buildItemItemMatrix,
  cosineRank,
  getRecommendations
} from "#utils/recommendationEngine.js";


const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5002";
const ML_TIMEOUT_MS = parseInt(process.env.ML_TIMEOUT_MS || "3000", 10);

const publicFilter = {
  isPrivate: false, isDeleted: false, status: COURSE_STATUS.live
};

const coursePopulate = [
  { path: "category", select: "name slug" },
  {
    path: "instructor.ref", select: "name pfpImg"
  }
];

const ACTION_WEIGHT = {
  completed: 3,
  active: 2,
  wishlist: 1,
};

const ratingMultiplier = (rating) => {
  if (!rating || rating < 1) return 1;
  return Math.max(0, Math.min(2, 1 + (rating - 3) * 0.5));
};

export const getRecommendedCourses = async (
  userId, recommendedSize = 8, candidatesLimit = 100
) => {
  if (!userId) return {
    courses: await getBestSellers(publicFilter, recommendedSize),
    debugSource: "Fallback(BestSellers)"
  };

  try {
    const mlResult = await getRecommendationsFromMLService(userId, recommendedSize);
    if (mlResult) return mlResult;
  } catch (err) {
    logger.warn("[Recommendation] ML service unavailable, falling back to Node.js:", err.message);
  }

  return getRecommendedCoursesNodeFallback(userId, recommendedSize, candidatesLimit);
};

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

    // No signals / no model → let the caller fall back.
    if (!data.recommendations || data.recommendations.length === 0) {
      if (data.debug_source === "NoSignals") {
        return {
          courses: await getBestSellers(publicFilter, topK),
          debugSource: "Fallback(BestSellers)"
        };
      }
      return null;
    }

    const courseIds = data.recommendations.map(r => r.courseId);
    const courses = await Course.find({ _id: { $in: courseIds } })
      .populate(coursePopulate)
      .lean();

    // Keep the order the ML service returned.
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
      debugSource: `ML(${data.debug_source || "Gated"})`,
    };
  } finally {
    clearTimeout(timeout);
  }
};

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

  const [enrollments, wishlist, reviews, user] = await Promise.all([
    Enrollment.find({ student: userId }).populate(commonPopulate).lean(),
    Wishlist.find({ user: userId }).populate(commonPopulate).lean(),
    Review.find({ user: userId, isDeleted: false }).select("course rating").lean(),
    User.findById(userId).select("interests").lean()
  ]);

  const reviewByCourse = new Map(
    reviews.map(r => [String(r.course), r.rating])
  );

  // Turn enrollments + wishlist into { course, weight } entries.
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

  // Don't recommend courses the user already owns.
  const purchasedIds = enrollments
    .filter(e => e.status === ENROLL_STATUS.active || e.status === ENROLL_STATUS.completed)
    .map(e => e.course?._id?.toString())
    .filter(Boolean);

  const userInterests = (user?.interests || []).filter(Boolean);

  if (weightedHistory.length === 0 && userInterests.length === 0) {
    return {
      courses: await getBestSellers(publicFilter, recommendedSize),
      debugSource: "Fallback(BestSellers)"
    };
  }

  const userProfileText = buildUserProfileText(weightedHistory, userInterests);

  const candidates = await Course.find({
    ...publicFilter,
    _id: { $nin: purchasedIds }
  })
    .populate(coursePopulate)
    .limit(candidatesLimit)
    .lean();

  if (candidates.length === 0) {
    return {
      courses: await getBestSellers(publicFilter, recommendedSize),
      debugSource: "Fallback(BestSellers)"
    };
  }

  // Score each candidate on three signals: content match (BM25), collaborative
  // filtering (item-item Jaccard), and a popularity prior.
  const contentScores = new Map();
  const contentRanked = cosineRank(userProfileText, candidates, candidates.length);
  for (const { doc, score } of contentRanked) {
    contentScores.set(String(doc._id), score);
  }

  const cfScores = await scoreByItemItemCf(weightedHistory, candidates);

  const popScores = new Map(
    candidates.map(c => [String(c._id), Math.log((c.studentsEnrolled || 0) + 1)])
  );

  // Gating: anything with a collaborative signal outranks anything without it.
  const scored = candidates.map(c => {
    const id = String(c._id);
    return {
      doc: c,
      cf: cfScores.get(id) || 0,
      content: contentScores.get(id) || 0,
      pop: popScores.get(id) || 0,
    };
  });

  const tier1 = scored
    .filter(s => s.cf > 0)
    .sort((a, b) => (b.cf - a.cf) || (b.content - a.content));
  const tier2 = scored
    .filter(s => s.cf === 0)
    .sort((a, b) => (b.content - a.content) || (b.pop - a.pop));

  const ranked = [...tier1, ...tier2].slice(0, recommendedSize);

  if (ranked.length === 0) {
    return {
      courses: await getBestSellers(publicFilter, recommendedSize),
      debugSource: "Fallback(BestSellers)"
    };
  }

  const finalCourses = ranked.map(s => ({
    ...s.doc,
    similarityScore: s.cf > 0 ? s.cf : s.content
  }));

  const usedContent = [...contentScores.values()].some(v => v > 0);
  const usedCf = [...cfScores.values()].some(v => v > 0);
  const debugSource = `Gated(${[
    usedCf ? "ItemCF(Jaccard)" : null,
    usedContent ? "Content(BM25)" : null,
    "Popularity"
  ].filter(Boolean).join("+")})`;

  return { courses: finalCourses, debugSource };
};

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

// score(c) = Σ over the user's history of weight(h) · jaccardSim(h, c).
const scoreByItemItemCf = async (weightedHistory, candidates) => {
  const out = new Map(candidates.map(c => [String(c._id), 0]));
  if (weightedHistory.length === 0) return out;

  const matrix = await buildItemItemMatrixFromDb();
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

// Build the item-item Jaccard matrix from the current interactions in the DB.
const buildItemItemMatrixFromDb = async () => {
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

const getBestSellers = async (filter, recommendedSize = 8) => {
  return await Course.find({ ...filter })
    .populate(coursePopulate)
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
  }).populate(coursePopulate)
    .limit(candidatesLimit)
    .lean();

  const targetProfile = {
    title: current.title || '',
    subtitle: current.subtitle || '',
    tag: (current.tags || []).join(' ') || '',
    category: current.category?.name || ''
  };

  let related = getRecommendations(targetProfile, candidates, relatedSize);
  let source = "BM25(ContentSimilarity)";

  // Not enough content matches → same category, then global bestsellers.
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
