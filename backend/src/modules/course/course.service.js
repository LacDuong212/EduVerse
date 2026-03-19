import Fuse from "fuse.js";
import AppError from "#exceptions/app.error.js";
import { existsEnrollment } from "#modules/enrollment/enrollment.service.js";
import { getCourseImageUploadParams } from "#modules/image/image.service.js";
import { getPaginationOptions } from "#utils/pagination.js";
import * as courseMapper from "./course.mapper.js";
import Course, { STATUS_ENUM } from "./course.model.js";
import Curriculum from "./curriculum.model.js";

const publicFilter = {
  isPrivate: false,
  isDeleted: false,
  status: STATUS_ENUM.live
};

const getEffectivePrice = (c) => (c.enableDiscount ? (c.discountPrice ?? c.price) : c.price);

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
  const { page, limit, skip } = getPaginationOptions(filters.page, filters.limit);
  const { search, sort, category, price, language, level, tag } = filters;

  const query = { ...publicFilter };

  if (category) query.category = category;
  if (language) query.language = language;
  if (level && level !== "all") query.level = level;
  
  if (tag) {
    query.tags = { $in: Array.isArray(tag) ? tag : [tag] };
  }

  if (price === "free") {
    query.$or = [
      { enableDiscount: true, discountPrice: 0 },
      { enableDiscount: false, price: 0 }
    ];
  } else if (price === "paid") {
    query.$or = [
      { enableDiscount: true, discountPrice: { $gt: 0 } },
      { enableDiscount: false, price: { $gt: 0 } }
    ];
  }

  if (search) {
    const candidates = await Course.find(query)
      .populate("category", "name slug")
      .sort({ studentsEnrolled: -1, createdAt: -1 })  // priority bucket
      .limit(1000)  // yes
      .lean();

    const fuse = new Fuse(candidates, {
      keys: ["title", "subtitle", "category.name", "tags"],
      threshold: 0.4,
    });

    const searchResults = fuse.search(search).map(r => r.item);

    const sortedDocs = sortDocs(searchResults, sort);
    const total = sortedDocs.length;
    const paginatedDocs = sortedDocs.slice(skip, skip + limit);

    return { courses: paginatedDocs, total, page, limit };
  } else {
    const dbSort = getMongoSort(sort);

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate("category", "name slug")
        .sort(dbSort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(query)
    ]);

    return { courses, total, page, limit };
  }
};

const sortDocs = (docs, strategy) => {
  const strategies = {
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    priceHighToLow: (a, b) => getEffectivePrice(b) - getEffectivePrice(a),
    priceLowToHigh: (a, b) => getEffectivePrice(a) - getEffectivePrice(b),
    mostPopular: (a, b) => (b.studentsEnrolled || 0) - (a.studentsEnrolled || 0),
    leastPopular: (a, b) => (a.studentsEnrolled || 0) - (b.studentsEnrolled || 0),
    ratingHighToLow: (a, b) => (b.rating?.average || 0) - (a.rating?.average || 0),
    ratingLowToHigh: (a, b) => (a.rating?.average || 0) - (b.rating?.average || 0),
  };

  return docs.sort(strategies[strategy] || strategies.newest);
};

const getMongoSort = (strategy) => {
  const maps = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    mostPopular: { studentsEnrolled: -1 },
    leastPopular: { studentsEnrolled: 1 },
    priceHighToLow: { price: -1 },  // !
    priceLowToHigh: { price: 1 },   // !
    ratingHighToLow: { "rating.average": -1 },
    ratingLowToHigh: { "rating.average": 1 },
  };

  return maps[strategy] || { createdAt: -1 };
};

export const getCourseInfoForVideoId = async (videoId) => {
  const result = await Curriculum.aggregate([
    { $match: { "sections.lectures.videoId": videoId } },
    { $unwind: "$sections" },
    { $unwind: "$sections.lectures" },
    { $match: { "sections.lectures.videoId": videoId } },
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "courseInfo"
      }
    },
    { $unwind: "$courseInfo" },
    {
      $project: {
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

export const getCoursePublicDetails = async (user, courseId) => {
  if (!courseId) throw new AppError("Invalid course ID format.", 400);

  const details = await Course.findOne({ _id: courseId, ...publicFilter })
    .populate([{
      path: "category",
      select: "name slug",
    }, {
      path: "curriculum",
      select: {
        "_id": 0,
        "sections.lectures.aiData": 0,
        "__v": 0
      }
    }]).lean();
  if (!details && Object.keys(details).length === 0) throw new AppError("Course not found.", 404);

  let isOwned = undefined;
  if (user) {
    const isCreator = user.role === "instructor" && user.userId === details.instructor?.ref;
    const isBought = user.role === "student" && (await existsEnrollment(user.userId, courseId));

    isOwned = !!(isCreator || isBought);
  }

  return {
    ...courseMapper.toCourseDetailsDto(details),
    isOwned,
  };
};

export const updateCourseRating = async (
  courseId,
  { oldRating, newRating, isNew, isDeleted },
  session = null
) => {
  const update = { $inc: {} };

  if (isNew) {
    update.$inc["rating.count"] = 1;
    update.$inc["rating.total"] = newRating;
    update.$inc[`rating.stars.${newRating}`] = 1;
  }
  else if (isDeleted) {
    update.$inc["rating.count"] = -1;
    update.$inc["rating.total"] = -oldRating;
    update.$inc[`rating.stars.${oldRating}`] = -1;
  }
  else {
    const delta = newRating - oldRating;
    if (delta === 0) return null;

    update.$inc["rating.total"] = delta;
    update.$inc[`rating.stars.${oldRating}`] = -1;
    update.$inc[`rating.stars.${newRating}`] = 1;
  }

  return await Course.updateOne({ _id: courseId }, update, { session });
};

export const getImageParams = async (courseId, insId) => {
  const course = await Course.findOne({
    _id: courseId,
    isDeleted: false,
  }).lean();

  if (!course) throw new AppError("Course not found.", 404);
  if (course.instructor?.ref?.toString() !== insId)
    throw new AppError("You don't have access to this course.", 403);

  return getCourseImageUploadParams(courseId);
};