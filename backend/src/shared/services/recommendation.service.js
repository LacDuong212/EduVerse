import AppError from "#exceptions/app.error.js";
import Course, { STATUS_ENUM as COURSE_STATUS } from "#modules/course/course.model.js";
import Enrollment, { STATUS_ENUM as ENROLL_STATUS } from "#modules/enrollment/enrollment.model.js";
import User from "#modules/user/user.model.js";
import Wishlist from "#modules/wishlist/wishlist.model.js";
import { getRecommendations } from "#utils/recommendationEngine.js";

const publicFilter = {
  isPrivate: false, isDeleted: false, status: COURSE_STATUS.live
};

export const getRecommendedCourses = async (
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

  const [enrollments, wishlist, user] = await Promise.all([
    Enrollment.find({ student: userId }).populate(commonPopulate).lean(),
    Wishlist.find({ user: userId }).populate(commonPopulate).lean(),
    User.findById(userId).select("interests").lean()
  ]);

  const history = [...enrollments.map(e => e.course), ...wishlist.map(w => w.course)]
    .filter(Boolean);

  const purchasedIds = enrollments.filter(e => e.status === ENROLL_STATUS.active)
    .map(e => e.course?._id?.toString())
    .filter(Boolean);

  const userInterests = user?.interests?.filter(Boolean) || [];

  if (history.length === 0 && userInterests.length === 0) {
    return {
      courses: await getBestSellers(publicFilter, recommendedSize),
      debugSource: "Fallback(BestSellers)"
    };
  }

  const userProfile = buildUserProfile(history, userInterests);

  const candidates = await Course.find({ ...publicFilter, _id: { $nin: purchasedIds } })
    .populate("category", "name slug")
    .limit(candidatesLimit)
    .lean();

  const recommended = getRecommendations(userProfile, candidates, recommendedSize);

  let source = "Fallback(BestSellers)";
  let finalCourses = [];

  if (recommended.length > 0) {
    finalCourses = recommended;
    const hasHistory = history.length > 0;
    const hasInterests = user?.interests?.length > 0;

    if (hasHistory && hasInterests) source = "Hybrid(History + Interests)";
    else if (hasHistory) source = "HistoryOnly";
    else if (hasInterests) source = "InterestsOnly";
  } else {
    finalCourses = await getBestSellers(publicFilter, recommendedSize);
  }

  return { courses: finalCourses, debugSource: source };
};

const buildUserProfile = (history, interests) => {
  return {
    title: [...history.map(c => c.title), ...interests].join(' '),
    subtitle: history.map(c => c.subtitle).join(' '),
    tag: [...history.flatMap(c => c.tags || []), ...interests].join(' '),
    category: [...history.map(c => c.category?.name || ''), ...interests].join(' ')
  };
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
    title: current.title  || '',
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