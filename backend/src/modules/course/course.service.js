import Fuse from "fuse.js";
import { getPaginationOptions } from "#utils/pagination.js";
import courseMapper from "./course.mapper.js";
import Course from "./course.model.js";
import Curriculum from "./curriculum.model.js";

const publicFilter = {
  isPrivate: false,
  isDeleted: false,
  status: "live"
};

export const getHomeDashboardData = async () => {
  const commonPopulate = { path: "category", select: "name slug" };

  const [newest, bestSellers, topRated, biggestDiscounts] = await Promise.all([
    // newest
    Course.find(publicFilter).populate(commonPopulate).sort({ createdAt: -1 }).limit(8),
    // best sellers
    Course.find(publicFilter).populate(commonPopulate).sort({ studentsEnrolled: -1 }).limit(6),
    // top rated
    Course.find(publicFilter).populate(commonPopulate).sort({ "rating.average": -1, "rating.count": -1 }).limit(8),
    // biggest discounts
    Course.aggregate([
      { $match: { ...publicFilter, discountPrice: { $ne: null } } },
      { $addFields: { discountAmount: { $subtract: ["$price", "$discountPrice"] } } },
      { $sort: { discountAmount: -1 } },
      { $limit: 4 }
    ])
  ]);

  await Course.populate(biggestDiscounts, commonPopulate);

  return {
    newest: courseMapper.toCourseCardDtoList(newest),
    bestSellers: courseMapper.toCourseCardDtoList(bestSellers),
    topRated: courseMapper.toCourseCardDtoList(topRated),
    biggestDiscounts: courseMapper.toCourseCardDtoList(biggestDiscounts),
  };
};

export const getGlobalCourseStats = async () => {
  const [stats, distinctInstructors] = await Promise.all([
    Course.aggregate([
      { $match: publicFilter },
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          totalLearners: { $sum: "$studentsEnrolled" },
          totalDurationSeconds: { $sum: "$duration" }
        }
      }
    ]),
    Course.distinct("instructor.ref", publicFilter)
  ]);

  const data = stats[0] || { totalCourses: 0, totalLearners: 0, totalDurationSeconds: 0 };

  return {
    totalCourses: data.totalCourses,
    totalLearners: data.totalLearners,
    totalInstructors: distinctInstructors.length,
    totalHours: Math.round((data.totalDurationSeconds / 3600) * 10) / 10
  };
};

export const queryCourses = async (filters) => {
  const { page, limit, skip } = getPaginationOptions(filters);
  const {
    search, category, subCategory,
    sort, price, level, language
  } = filters;

  const query = { ...publicFilter };

  if (category) query.category = category;
  if (subCategory) query.subCategory = subCategory;
  if (language) query.language = language;
  if (level && level !== "all") query.level = level;
  if (price === "free") query.price = 0;
  if (price === "paid") query.price = { $gt: 0 };

  let finalDocs = [];
  if (search) {
    const candidates = await Course.find(query)
      .populate("category", "name slug")
      .sort({ studentsEnrolled: -1, createdAt: -1 })  // !
      .limit(1000)  // !
      .lean();

    const fuse = new Fuse(candidates, {
      keys: ["title", "subtitle", "category.name", "tags"],
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 1,
    });

    finalDocs = fuse.search(search).map(r => r.item);
  } else {
    finalDocs = await Course.find(query)
      .populate("category", "name slug")
      .lean();
  }

  const sortedDocs = sortDocs(finalDocs, sort);
  const total = sortedDocs.length;
  const paginatedDocs = sortedDocs.slice(skip, skip + limit);

  return { courses: paginatedDocs, total, page, limit };
};

const sortDocs = (docs, strategy) => {
  const strategies = {
    newest: (a, b) => b.createdAt - a.createdAt,
    oldest: { createdAt: 1 },
    priceHighToLow: (a, b) => b.price - a.price,
    priceLowToHigh: (a, b) => a.price - b.price,
    mostPopular: (a, b) => b.studentsEnrolled - a.studentsEnrolled,
    leastPopular: (a, b) => a.studentsEnrolled - b.studentsEnrolled,
    ratingHighToLow: (a, b) => (b.rating?.average || 0) - (a.rating?.average || 0),
    ratingLowToHigh: (a, b) => (a.rating?.average || 0) - (b.rating?.average || 0),
  };
  return docs.sort(strategies[strategy] || strategies.newest);
};

export const getCourseInfoForVideoId = async (videoId) => {
  const result = await Curriculum.aggregate([
    { $match: { "sections.lectures.videoId": videoId } },
    { $unwind: "$sections" },
    { $unwind: "$sections.lectures" },
    { $match: { "sections.lectures.videoId": videoId } },
    { $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "courseInfo"
      }
    },
    { $unwind: "$courseInfo" },
    { $project: {
        _id: 0,
        courseId: 1,
        insId: "$courseInfo.instructor.ref",
        isFree: "$sections.lectures.isFree"
      }
    }
  ]);

  const courseInfo = result[0];
  
  return {
    courseId: courseInfo?.courseId || null,
    insId: courseInfo?.insId || null,
    isFree: courseInfo?.isFree ?? false
  };
};


export default {
  getHomeDashboardData,
  getGlobalCourseStats,
  queryCourses,
  getCourseInfoForVideoId,

};