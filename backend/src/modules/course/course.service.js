import Fuse from "fuse.js";
import mongoose, { get } from "mongoose";
import AppError from "#exceptions/app.error.js";
import { existsEnrollment } from "#modules/enrollment/enrollment.service.js";
import Instructor from "#modules/instructor/instructor.model.js";
import { getCurrentInstructor } from "#modules/instructor/instructor.service.js";
import { getCourseImageUploadParams } from "#modules/image/image.service.js";
import { getPaginationOptions } from "#utils/pagination.js";
import { withTransaction } from "#utils/transaction.js";
import * as courseMapper from "./course.mapper.js";
import Course, { STATUS_ENUM, UPDATE_STATUS_ENUM } from "./course.model.js";
import { courseSchema } from "./course.validation.js";
import Curriculum from "./curriculum.model.js";

const publicFilter = {
  isDeleted: false,
  isPrivate: false,
  status: STATUS_ENUM.live
};

const getEffectivePrice = (c) =>
  (c.enableDiscount ? (c.discountPrice ?? c.price) : c.price);
const getAverageRating = (c) =>
  (c.rating?.count > 0 ? c.rating?.total / c.rating?.count : 0);

export const getCourseAccess = async (userRole, userId, course) => {
  if (!userRole || !userId) return { isOwner: false, isEnrolled: false };

  const isOwner = userRole === "instructor" && course.instructor.ref.toString() === userId;
  const isEnrolled = userRole === "student" && await existsEnrollment(userId, course._id);

  return { isOwner, isEnrolled };
};

export const getHomeDashboardData = async () => {
  const commonPopulate = [
    { path: "category", select: "name slug" },
    {
      path: "instructor", select: "name pfpImg"
    }
  ];

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
    ratingHighToLow: (a, b) => getAverageRating(b) - getAverageRating(a),
    ratingLowToHigh: (a, b) => getAverageRating(a) - getAverageRating(b),
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
    ratingHighToLow: { "rating.total": -1 },  // !
    ratingLowToHigh: { "rating.total": 1 },   // !
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

  const details = await Course.findOne({ _id: courseId, isDeleted: false })
    .populate([{
      path: "category",
      select: "name slug",
    }, {
      path: "instructor",
      select: "name pfpImg"
    }, {
      path: "curriculum",
      select: {
        "_id": 0,
        "sections.lectures.aiData": 0,
        "__v": 0
      }
    }]).lean();
  if (!details || Object.keys(details).length === 0)
    throw new AppError("Course not found.", 404);

  if (details.status !== STATUS_ENUM.live)
    throw new AppError("Course is currently unavailable, please try again later.", 400);

  let isOwned = undefined;
  if (user) {
    const { isOwner, isEnrolled } = await getCourseAccess(user.role, user.userId, details);
    isOwned = isOwner || isEnrolled;
  }

  if (!isOwned && details.isPrivate)
    throw new AppError("Course is currently unavailable, please try again later.", 400);

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
  const courseUpdate = { $inc: {} };
  const instructorUpdate = { $inc: {} };

  if (isNew) {
    courseUpdate.$inc["rating.count"] = 1;
    courseUpdate.$inc["rating.total"] = newRating;
    courseUpdate.$inc[`rating.stars.${newRating}`] = 1;

    instructorUpdate.$inc["stats.totalReviews"] = 1;
    instructorUpdate.$inc["stats.ratingSum"] = newRating;
  }
  else if (isDeleted) {
    courseUpdate.$inc["rating.count"] = -1;
    courseUpdate.$inc["rating.total"] = -oldRating;
    courseUpdate.$inc[`rating.stars.${oldRating}`] = -1;

    instructorUpdate.$inc["stats.totalReviews"] = -1;
    instructorUpdate.$inc["stats.ratingSum"] = -oldRating;
  }
  else {
    const delta = newRating - oldRating;
    if (delta === 0) return null;

    courseUpdate.$inc["rating.total"] = delta;
    courseUpdate.$inc[`rating.stars.${oldRating}`] = -1;
    courseUpdate.$inc[`rating.stars.${newRating}`] = 1;

    instructorUpdate.$inc["stats.ratingSum"] = delta;
  }

  await Promise.all([
    Course.updateOne({ _id: courseId }, courseUpdate, { session }),
    Instructor.updateOne({ myCourses: courseId }, instructorUpdate, { session })
  ]);
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

export const getCourseFullCurriculum = async (user, courseId) => {
  if (!courseId) throw new AppError("Course ID is required.", 400);

  const course = await Course.findOne({ _id: courseId, isDeleted: false })
    .populate({
      path: "curriculum",
      select: "sections"
    })
    .lean();

  if (!course) throw new AppError("Course not found.", 404);
  if (course.status !== STATUS_ENUM.live)
    throw new AppError("Course is currently unavailable, please try again later.", 400);

  let isOwner = false;
  let isEnrolled = false;

  if (user) {
    const access = await getCourseAccess(user.role, user.userId, course);
    isOwner = access.isOwner;
    isEnrolled = access.isEnrolled;
  }

  if (!isOwner && !isEnrolled) {
    if (course.isPrivate)
      throw new AppError("Course is currently unavailable, please try again later.", 400);

    return courseMapper.getCourseFreeCurriculum(course.curriculum?.sections || []);
  } else {
    const hasAiData = isOwner;
    return courseMapper.getCourseCurriculum(course.curriculum?.sections || [], hasAiData);
  }
};

export const toggleCoursePrivacy = async (
  courseId, insId, session = null
) => {
  if (!courseId) throw new AppError("Course ID is required.", 400);

  return await withTransaction(async (s) => {
    const course = await Course.findOne({
      _id: courseId,
      isDeleted: false,
    });

    if (!course) throw new AppError("Course not found.", 404);

    if (course.instructor?.ref?.toString() !== insId)
      throw new AppError("You cannot modify this course.", 403);

    course.isPrivate = !course.isPrivate;
    await course.save({ s });

    return course.isPrivate;
  }, session);
};

export const getTopTags = async (limit = 20) => {
  const tags = await Course.aggregate([
    { $match: { ...publicFilter } },
    { $unwind: "$tags" },
    {
      $group: {
        _id: { $toLower: "$tags" },
        name: { $first: "$tags" },
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);

  return tags;
};

export const getPaginatedInstructorCourses = async (userId, filters) => {
  if (!userId) throw new AppError("Instructor ID is required.", 400);

  const { page, limit, skip } = getPaginationOptions(filters.page, filters.limit);
  const { search, sort } = filters;

  const query = {
    "instructor.ref": userId,
    isDeleted: false,
  };

  if (search) {
    const candidates = await Course.find(query)
      .populate("category", "name slug")
      .limit(1000)
      .lean();

    const fuse = new Fuse(candidates, {
      keys: ["title", "subtitle", "category.name", "tags"],
      threshold: 0.4,
    });

    const searchResults = fuse.search(search).map((r) => r.item);
    const sorted = sortInstructorCourses(searchResults, sort);

    const total = sorted.length;
    const paginated = sorted.slice(skip, skip + limit);

    return {
      courses: courseMapper.toCourseRowItemDtoList(paginated),
      total,
      page,
      limit,
    };
  }

  const dbSort = getInstructorCourseSort(sort);
  const [courses, total] = await Promise.all([
    Course.find(query)
      .populate("category", "name slug")
      .sort(dbSort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Course.countDocuments(query),
  ]);

  return {
    courses: courseMapper.toCourseRowItemDtoList(courses),
    total,
    page,
    limit,
  };
};

const sortInstructorCourses = (docs, strategy) => {
  const strategies = {
    recentUpdate: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    mostPopular: (a, b) => (b.studentsEnrolled || 0) - (a.studentsEnrolled || 0),
    leastPopular: (a, b) => (a.studentsEnrolled || 0) - (b.studentsEnrolled || 0),
    highestRating: (a, b) => (b.rating?.average || 0) - (a.rating?.average || 0),
    lowestRating: (a, b) => (a.rating?.average || 0) - (b.rating?.average || 0),
  };

  return docs.sort(strategies[strategy] || strategies.recentUpdate);
};

const getInstructorCourseSort = (strategy) => ({
  recentUpdate: { updatedAt: -1 },
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  mostPopular: { studentsEnrolled: -1 },
  leastPopular: { studentsEnrolled: 1 },
  highestRating: { "rating.average": -1 },
  lowestRating: { "rating.average": 1 },
})[strategy] || { updatedAt: -1 };

export const getInstructorCourseDetails = async (insId, courseId) => {
  if (!courseId) throw new AppError("Course ID is required.", 400);

  const course = await Course.findOne({ _id: courseId, isDeleted: false })
    .populate("category", "name slug")
    .lean();
  if (!course) throw new AppError("Course not found.", 404);
  if (course.instructor?.ref?.toString() !== insId)
    throw new AppError("You don't have access to this course.", 403);

  return courseMapper.toInstructorCourseDto(course);
};

export const getPublicInstructorCourses = async (
  insId, limit = 6, skip = 0
) => {
  if (!insId) throw new AppError("Instructor ID is required.", 400);

  const query = {
    "instructor.ref": insId,
    ...publicFilter
  };

  const [courses, total] = await Promise.all([
    Course.find(query)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit + 1)
      .lean(),
    Course.countDocuments(query)
  ]);

  const hasMore = courses.length > limit;
  const coursesToReturn = hasMore ? courses.slice(0, limit) : courses;

  return {
    courses: courseMapper.toCourseCardDtoList(coursesToReturn),
    hasMore,
    total,
    nextSkip: hasMore ? skip + limit : null
  };
};

export const createDraftCourse = async (insId) => {
  if (!insId) throw new AppError("Instructor ID is required.", 400);

  return withTransaction(async (session) => {
    const instructor = await getCurrentInstructor(insId, session);
    if (!instructor) throw new AppError("Instructor not found.", 404);

    const [course] = await Course.create([{
      title: "New draft course",
      "instructor.ref": new mongoose.Types.ObjectId(insId),
      "instructor.name": instructor.name,
      "instructor.avatar": instructor.avatar,
      category: null,
      price: null,
      enableDiscount: false,
      status: STATUS_ENUM.draft,
      isPrivate: true,
      isDeleted: false
    }], { session });

    await Curriculum.create([{
      courseId: course._id,
      sections: [],
    }], { session });

    return courseMapper.toSimpleCourse(course);
  });
};

const getPlainPendingData = (pendingUpdate) => {
  return pendingUpdate?.data || {};
};

const getMergedCourseState = (courseDoc, curriculumDoc) => {
  const pendingCourse = courseDoc.pendingUpdate?.data || {};
  const pendingCurr = curriculumDoc?.pendingUpdate?.data || {};

  return {
    course: {
      ...courseDoc.toObject(),
      ...pendingCourse, // Overwrites live fields with pending ones
      hasPendingChanges: Object.keys(pendingCourse).length > 0
    },
    curriculum: {
      // Use pending sections if they exist, otherwise live
      sections: pendingCurr.sections || curriculumDoc?.sections || [],
      hasPendingChanges: !!pendingCurr.sections?.length
    }
  };
};

const getProcessedCurriculum = (incomingSections, curriculumDoc) => {
  const liveLectures = (curriculumDoc?.sections || []).flatMap(s => s.lectures || []);
  const pendingLectures = (curriculumDoc?.pendingUpdate?.data?.sections || []).flatMap(s => s.lectures || []);

  const aiDataMap = new Map();
  [...liveLectures, ...pendingLectures].forEach(l => {
    if (l.videoId && l.aiData) aiDataMap.set(l.videoId, l.aiData);
  });

  return (incomingSections || []).map(section => {
    return {
      _id: section.secId || new mongoose.Types.ObjectId(),
      title: section.title,
      lectures: (section.lectures || []).map(lecture => {
        const preservedAiData = aiDataMap.get(lecture.videoId) || null;

        return {
          _id: lecture.lecId || new mongoose.Types.ObjectId(),
          title: lecture.title,
          duration: lecture.duration,
          videoId: lecture.videoId,
          isFree: lecture.isFree ?? false,
          aiData: preservedAiData
        };
      })
    };
  });
};

export const updateCourse = async (insId, courseId, changes, session = null) => {
  return await withTransaction(async (s) => {
    const course = await Course.findById(courseId).session(s);
    if (!course || course.instructor?.ref?.toString() !== insId)
      throw new AppError("Course not found or unauthorized access.", 403);

    let curriculumDoc = await Curriculum.findOne({ courseId }).session(s);
    if (!curriculumDoc) {
      curriculumDoc = new Curriculum({ courseId });
    }

    const { curriculum, categoryId, ...courseData } = changes;
    if (categoryId) courseData.category = new mongoose.Types.ObjectId(categoryId);

    const cleanCourseData = Object.fromEntries(
      Object.entries(courseData).filter(([_, v]) => v !== undefined)
    );
    const plainPending = getPlainPendingData(course.pendingUpdate);

    course.pendingUpdate = {
      data: { ...plainPending, ...cleanCourseData },
      submittedAt: new Date(),
      status: UPDATE_STATUS_ENUM.none
    };
    course.markModified("pendingUpdate.data");

    if (curriculum) {
      const processedSections = getProcessedCurriculum(curriculum.sections, curriculumDoc);

      curriculumDoc.pendingUpdate = {
        data: { sections: processedSections },
        submittedAt: new Date(),
        status: UPDATE_STATUS_ENUM.none
      };
      curriculumDoc.markModified("pendingUpdate.data");
    }

    await course.save({ session: s });
    await curriculumDoc.save({ session: s });

    const {
      course: mergedCourse, curriculum: mergedCurr
    } = getMergedCourseState(course, curriculumDoc);

    return courseMapper.toEditCourseDto(mergedCourse, mergedCurr);
  }, session);
};

export const submitCourse = async (insId, courseId, changes = null, session = null) => {
  return await withTransaction(async (s) => {
    if (changes && Object.keys(changes).length > 0) {
      await updateCourse(insId, courseId, changes, s);
    }

    const courseDoc = await Course.findById(courseId).session(s);
    const curriculumDoc = await Curriculum.findOne({ courseId }).session(s);

    if (!courseDoc || courseDoc.instructor?.ref?.toString() !== insId) {
      throw new AppError("Course not found or unauthorized.", 403);
    }

    const {
      course: mergedCourse, curriculum: mergedCurr
    } = getMergedCourseState(courseDoc, curriculumDoc);

    const categoryId = (mergedCourse.category?._id || mergedCourse.category)?.toString() || null;

    const validation = courseSchema.safeParse({
      ...mergedCourse,
      categoryId,
      curriculum: { sections: mergedCurr.sections || [] }
    });

    if (!validation.success) {
      throw validation.error;
    }

    if (courseDoc.status === STATUS_ENUM.draft) {
      courseDoc.status = STATUS_ENUM.pending;
    }

    const now = new Date();

    if (Object.keys(courseDoc.pendingUpdate?.data || {}).length > 0) {
      courseDoc.pendingUpdate.status = UPDATE_STATUS_ENUM.pending;
      courseDoc.pendingUpdate.submittedAt = now;
      courseDoc.markModified("pendingUpdate");
    }

    if (curriculumDoc?.pendingUpdate?.data?.sections?.length > 0) {
      curriculumDoc.pendingUpdate.status = UPDATE_STATUS_ENUM.pending;
      curriculumDoc.pendingUpdate.submittedAt = now;
      curriculumDoc.markModified("pendingUpdate");
    }

    await courseDoc.save({ session: s });
    if (curriculumDoc) await curriculumDoc.save({ session: s });

    mergedCourse.status = courseDoc.status;
    return courseMapper.toEditCourseDto(mergedCourse, mergedCurr);
  }, session);
};

export const clearPendingChanges = async (insId, courseId, session = null) => {
  return await withTransaction(async (s) => {
    const course = await Course.findById(courseId).session(s);
    if (!course || course.instructor?.ref?.toString() !== insId)
      throw new AppError("Course not found or unauthorized access.", 403);

    if (course.status === STATUS_ENUM.pending)
      throw new AppError("Cannot undo changes while the course is under review.", 400);

    const curriculumDoc = await Curriculum.findOne({ courseId }).session(s);

    const hasCourseChanges = Object.keys(course.pendingUpdate?.data || {}).length > 0;
    const hasCurriculumChanges = !!curriculumDoc?.pendingUpdate?.data?.sections?.length;

    if (!hasCourseChanges && !hasCurriculumChanges)
      throw new AppError("There are no changes to clear.", 400);

    course.pendingUpdate = {
      data: null,
      submittedAt: null,
      status: UPDATE_STATUS_ENUM.none
    };
    course.markModified("pendingUpdate");
    await course.save({ session: s });

    if (curriculumDoc) {
      curriculumDoc.pendingUpdate = {
        data: null,
        submittedAt: null,
        status: UPDATE_STATUS_ENUM.none
      };
      curriculumDoc.markModified("pendingUpdate");
      await curriculumDoc.save({ session: s });
    }

    const {
      course: mergedCourse, curriculum: mergedCurr
    } = getMergedCourseState(course, curriculumDoc);

    return courseMapper.toEditCourseDto(mergedCourse, mergedCurr);
  }, session);
};

export const getCourseForEdit = async (insId, courseId) => {
  if (!insId) throw new AppError("Instructor ID is required.", 400);

  const courseDoc = await Course.findById(courseId).populate("curriculum");

  if (!courseDoc || courseDoc.instructor?.ref?.toString() !== insId)
    throw new AppError("Course not found or unauthorized access.", 403);

  const {
    course: mergedCourse,
    curriculum: mergedCurr
  } = getMergedCourseState(courseDoc, courseDoc.curriculum);

  return courseMapper.toEditCourseDto(mergedCourse, mergedCurr);
};

export const updateCoursesInstructorInfo = async (insId, name, avatar, session = null) => {
  if (!insId) throw new AppError("Instructor ID is required.", 400);
  
  return await withTransaction(async (s) => {
    const updateData = {};

    if (name !== undefined) updateData["instructor.name"] = name;
    if (avatar !== undefined) updateData["instructor.avatar"] = avatar;

    if (Object.keys(updateData).length === 0) return;

    await Course.updateMany(
      { "instructor.ref": insId },
      { $set: updateData },
      { session: s }
    );
  }, session);
};

// #TODO: REMOVE!!
export const approveCourseUpdate = async (courseId, session = null) => {
  return await withTransaction(async (s) => {
    const course = await Course.findById(courseId).session(s);
    if (!course) throw new AppError("Course not found.", 404);

    const curriculum = await Curriculum.findOne({ courseId }).session(s);
    let oldVideoIds = [];

    const isPendingCourse = course.status === STATUS_ENUM.pending
      || course.pendingUpdate?.status === UPDATE_STATUS_ENUM.pending;
    if (!isPendingCourse) throw new AppError("Course is not pending review.", 400);

    if (curriculum?.pendingUpdate?.data?.sections) {
      const pendingSections = getPlainPendingData(curriculum.pendingUpdate).sections;

      const currentVideoIds = (curriculum.sections || [])
        .flatMap(sec => sec.lectures || [])
        .map(l => l.videoId)
        .filter(Boolean);

      let newTotalDuration = 0;
      const newVideoIds = new Set();

      pendingSections.forEach(section => {
        (section.lectures || []).forEach(lecture => {
          if (lecture.videoId) newVideoIds.add(lecture.videoId);
          newTotalDuration += Number(lecture.duration || 0);
        });
      });

      course.duration = newTotalDuration;

      oldVideoIds = currentVideoIds.filter(id => !newVideoIds.has(id));

      curriculum.sections = pendingSections;
      curriculum.pendingUpdate = { data: null, submittedAt: null, status: UPDATE_STATUS_ENUM.none };

      curriculum.markModified("sections");
      await curriculum.save({ session: s });
    }

    if (course.pendingUpdate?.data) {
      const updates = getPlainPendingData(course.pendingUpdate);
      Object.keys(updates).forEach((key) => {
        course.set(key, updates[key]);
      });
      course.pendingUpdate = { data: null, submittedAt: null, status: UPDATE_STATUS_ENUM.none };
    }

    course.status = STATUS_ENUM.live;
    await course.save({ session: s });

    if (oldVideoIds.length > 0) {
      // #TODO: await expireOldVideos(oldVideoIds);
    }

    return oldVideoIds;
  }, session);
};