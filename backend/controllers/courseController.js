import Admin from "../models/adminModel.js";
import Course from "../models/courseModel.js";
import DraftVideo from "../models/draftVideoModel.js";
import Instructor from "../models/instructorModel.js";
import Order from "../models/orderModel.js";
import userInteraction from "../models/userInteraction.js";
import { generateStreamUrl } from "../utils/aws/getObject.js"; 

import Fuse from "fuse.js";

// HELPERS ---
// helper: extract videoUrl from lectures and previewVideo in course
const getAllVideoKeys = (data) => {
  const keys = new Set();
  
  // check previewVideo
  if (data.previewVideo) {
    keys.add(data.previewVideo);
  }

  // check curriculum
  if (data.curriculum && Array.isArray(data.curriculum)) {
    data.curriculum.forEach(section => {
      if (section.lectures && Array.isArray(section.lectures)) {
        section.lectures.forEach(lecture => {
          if (lecture.videoUrl) {
            keys.add(lecture.videoUrl);
          }
        });
      }
    });
  }
  return keys;
};


export const getHomeCourses = async (req, res) => {
  try {
    const newest = await Course.find()
      .sort({ createdAt: -1 })
      .limit(8);

    const bestSellers = await Course.find()
      .sort({ studentsEnrolled: -1 })
      .limit(6);

    const topRated = await Course.find()
      .sort({ "rating.average": -1, "rating.count": -1 })
      .limit(8);

    const biggestDiscounts = await Course.aggregate([
      { $match: { discountPrice: { $ne: null } } },
      { $addFields: { discountAmount: { $subtract: ["$price", "$discountPrice"] } } },
      { $sort: { discountAmount: -1 } },
      { $limit: 4 }
    ]);

    res.json({
      newest,
      bestSellers,
      topRated,
      biggestDiscounts,
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching home courses", error });
  }
};

export const getFullCourses = async (req, res) => {
  try {
    const courses = await Course.find();

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching courses",
    });
  }
};

export const getCoursesOverview = async (req, res) => {
  try {
    const userId = req.userId;

    const admin = await Admin.findById(userId);
    if (!admin || !admin.isVerified || !admin.isApproved) {
      return res.status(401).json({
        success: false,
        message: "Access denied",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const courses = await Course.find(/*{ isDeleted: false }*/) // #TODO
      .select("image thumbnail title instructor level createdAt price status isPrivate")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // lean = faster, returns plain JS objects

    const [totalCourses, activatedCourses, pendingCourses] = await Promise.all([
      Course.countDocuments({ isDeleted: false }),
      Course.countDocuments({ status: "Live", isDeleted: false }),
      Course.countDocuments({ status: "Pending", isDeleted: false }),
    ]);

    res.status(200).json({
      success: true,
      data: courses,
      meta: {
        totalCourses,
        activatedCourses,
        pendingCourses,
        currentPage: page,
        totalPages: Math.ceil(totalCourses / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    // query params
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const search = (req.query.search || "").trim();
    const { category, subCategory, sort, price, level, language } = req.query;

    const mongoFilter = {
      isPrivate: false,
      isDeleted: false,
      status: "Live"
    };

    if (category) mongoFilter.category = category;
    if (subCategory) mongoFilter.subCategory = subCategory;
    if (language) mongoFilter.language = language;
    if (level && level !== "All") mongoFilter.level = level;

    if (price === "free") mongoFilter.price = 0;
    if (price === "paid") mongoFilter.price = { $gt: 0 };

    let courseDocs = await Course.find(mongoFilter).lean();

    if (search) {
      const fuse = new Fuse(courseDocs, {
        keys: ["title", "subtitle", "category", "subCategory", "tags"],
        threshold: 0.5,
        ignoreLocation: true,
        minMatchCharLength: 1,
      });

      courseDocs = fuse.search(search).map((r) => r.item);
    }

    switch (sort) {
      case "newest":
        courseDocs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        courseDocs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "priceHighToLow":
        courseDocs.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "priceLowToHigh":
        courseDocs.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "mostPopular":
        courseDocs.sort((a, b) => (b.studentsEnrolled || 0) - (a.studentsEnrolled || 0));
        break;
      case "ratingHighToLow":
        courseDocs.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        break;
      default:
        courseDocs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = courseDocs.length;
    const paginated = courseDocs.slice((page - 1) * limit, page * limit);

    const sumLectureDurations = (cur = []) =>
      Array.isArray(cur)
        ? cur.reduce((acc, sec) => {
          const list = Array.isArray(sec?.lectures) ? sec.lectures : [];
          const s = list.reduce((a, lec) => a + (Number(lec?.duration) || 0), 0);
          return acc + s;
        }, 0)
        : 0;

    const countLecturesFromCurriculum = (cur = []) =>
      Array.isArray(cur)
        ? cur.reduce(
          (acc, sec) => acc + (Array.isArray(sec?.lectures) ? sec.lectures.length : 0),
          0
        )
        : 0;

    const data = paginated.map((c) => {
      const duration =
        typeof c.duration === "number" && !Number.isNaN(c.duration)
          ? c.duration
          : sumLectureDurations(c.curriculum);

      const lectures =
        typeof c.lecturesCount === "number" && !Number.isNaN(c.lecturesCount)
          ? c.lecturesCount
          : countLecturesFromCurriculum(c.curriculum);

      return {
        courseId: c.courseId || String(c._id),
        title: c.title,
        subtitle: c.subtitle,
        category: c.category,
        subCategory: c.subCategory,
        level: c.level,
        thumbnail: c.thumbnail,
        price: c.price,
        discountPrice: c.discountPrice,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        rating: {
          average: Number(c?.rating?.average ?? 0),
          count: Number(c?.rating?.count ?? 0),
          total: Number(c?.rating?.total ?? 0),
        },
        duration,
        lectures,
        studentsEnrolled: Number(c.studentsEnrolled || 0),
        instructor: c?.instructor
          ? {
            ref: c.instructor.ref,
            name: c.instructor.name,
            avatar: c.instructor.avatar,
          }
          : undefined,
      };
    });

    res.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching courses",
      error: error.message
    });
  }
};

export const getCourseFilters = async (req, res) => {
  try {
    const liveFilter = {
      isPrivate: false,
      isDeleted: false,
      status: "Live"
    };

    const categoriesPromise = Course.distinct("category", liveFilter);
    const languagesPromise = Course.distinct("language", liveFilter);

    const levels = ["All", "Beginner", "Intermediate", "Advanced"];

    const [categories, languages] = await Promise.all([
      categoriesPromise,
      languagesPromise
    ]);

    res.json({
      success: true,
      categories: categories.filter(Boolean),
      languages: languages.filter(Boolean),
      levels
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching filters",
      error: error.message
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    return res.json({ success: true, course });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const courseViewed = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    // Kiểm tra khóa học có tồn tại
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Ghi nhận lượt xem
    await userInteraction.findOneAndUpdate(
      { userId, productId: id, interactionType: 'view' },
      { interactedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, message: "Course view recorded" });
  } catch (error) {
    console.error("Error recording course view:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getViewedCourses = async (req, res) => {
  try {
    const userId = req.userId; // từ middleware auth
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { category, subCategory, search } = req.query;

    // Lấy tất cả interactions 'view' của user
    const interactions = await userInteraction.find({
      userId,
      interactionType: 'view'
    }).sort({ interactedAt: -1 });

    // Lấy danh sách courseId
    let courseIds = interactions.map(i => i.productId);

    // Lọc course theo các query params
    const filter = { _id: { $in: courseIds } };
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (search) filter.title = { $regex: search, $options: "i" };

    const total = await Course.countDocuments(filter);

    const courses = await Course.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      courses,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching viewed courses:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/courses/my-courses?page=1&limit=8
export const getOwnedCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    // get only completed orders
    const orders = await Order.find({
      user: req.userId,
      status: "completed",
    }).populate("courses.course");

    // extract unique courses
    const ownedCourses = [];
    const courseSet = new Set();

    for (const order of orders) {
      for (const item of order.courses) {
        const c = item.course;
        if (c && !courseSet.has(c._id.toString())) {
          courseSet.add(c._id.toString());

          ownedCourses.push(c);
        }
      }
    }

    // pagination
    const totalCourses = ownedCourses.length;
    const pagedCourses = ownedCourses.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      courses: pagedCourses,
      pagination: {
        total: totalCourses,
        page,
        limit,
        totalPages: Math.ceil(totalCourses / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching owned courses",
      error,
    });
  }
};

export const getRelatedCourses = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm course hiện tại
    const currentCourse = await Course.findById(id);
    if (!currentCourse) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Điều kiện tìm related
    const conditions = [
      { tags: { $in: currentCourse.tags || [] } },
      { category: currentCourse.category },
      { subCategory: currentCourse.subCategory }
    ];

    // Tìm tất cả course liên quan
    let relatedCourses = await Course.find({
      _id: { $ne: id },
      $or: conditions
    }).select("title thumbnail instructor studentsEnrolled rating price discountPrice ");

    // Loại bỏ trùng lặp (nếu có)
    const seen = new Set();
    relatedCourses = relatedCourses.filter(c => {
      if (seen.has(c._id.toString())) return false;
      seen.add(c._id.toString());
      return true;
    });

    res.json({
      success: true,
      courses: relatedCourses,
    });
  } catch (error) {
    console.error("Error in getRelatedCourses:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getEarningsHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;

    const skip = (page - 1) * limit;

    const matchStage = {};

    const results = await Order.aggregate([
      { $unwind: "$courses" },

      {
        $lookup: {
          from: "courses",
          localField: "courses.course",
          foreignField: "_id",
          as: "courseDetails",
        },
      },

      { $unwind: "$courseDetails" },

      { $match: matchStage },

      { $sort: { createdAt: -1 } },

      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: "$_id",
                name: "$courseDetails.title",
                date: "$createdAt",
                amount: "$courses.pricePaid",
                status: "$status",
                paymentMethod: {
                  $switch: {
                    branches: [
                      {
                        case: { $eq: ["$paymentMethod", "momo"] },
                        then: { type: "momo", image: "/assets/images/payment/momo.svg" }
                      },
                      {
                        case: { $eq: ["$paymentMethod", "vnpay"] },
                        then: { type: "vnpay", image: "/assets/images/payment/vnpay.svg" }
                      }
                    ],
                    default: { type: "unknown", image: "" }
                  }
                }
              }
            }
          ],
          pagination: [
            { $count: "total" }
          ]
        }
      }
    ]);

    const data = results[0].data;
    const totalItems = results[0].pagination[0] ? results[0].pagination[0].total : 0;
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      data: data,
      pagination: {
        total: totalItems,
        page: page,
        totalPages: totalPages,
        limit: limit
      }
    });

  } catch (error) {
    console.error("Error fetching earnings history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch earnings history",
      error: error.message,
    });
  }
};

export const getEarningsStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $facet: {
          completed: [
            { $match: { status: "completed" } },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$totalAmount" },
                totalOrders: { $sum: 1 },
              },
            },
          ],
          pending: [
            { $match: { status: "pending" } },
            {
              $group: {
                _id: null,
                pendingRevenue: { $sum: "$totalAmount" },
              },
            },
          ],
        },
      },
    ]);

    const completedData = stats[0].completed[0] || { totalRevenue: 0, totalOrders: 0 };
    const pendingData = stats[0].pending[0] || { pendingRevenue: 0 };

    const earningsCardsData = [
      {
        title: "Total Sales",
        amount: completedData.totalRevenue,
        variant: "success",
        isInfo: false,
      },
      {
        title: "Pending Revenue",
        amount: pendingData.pendingRevenue,
        variant: "orange",
        isInfo: false,
      },
      {
        title: "Completed Orders",
        amount: completedData.totalOrders,
        variant: "primary",
        isInfo: false,
      },
    ];

    res.json({
      success: true,
      data: earningsCardsData,
    });

  } catch (error) {
    console.error("Error fetching earnings stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch earnings stats",
      error: error.message,
    });
  }
};

// POST /api/courses
export const createCourse = async (req, res) => {
  try {
    const userId = req.userId;

    const instructor = await Instructor.findOne({ user: userId }).populate('user');
    if (!instructor) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to create a course"
      });
    }

    const validation = validateCourse(req.body);
    if (!validation.success) {
      return res.status(400).json(validation);
    }

    // #TODO: parse in FE not here, calculate duration base off lectures
    if (req.body.duration !== null) {
      const duration = parseDurationToHours(req.body.duration, req.body.durationUnit);
      if (duration.error) {
        return res.status(400).json({ success: false, message: duration.error });
      }

      req.body.duration = duration.hours;
      req.body.durationUnit = 'hour';
    }

    const newCourse = new Course({
      ...req.body, // passes all fields (title, curriculum, price, etc.)

      instructor: {
        ref: userId,
        name: instructor?.user?.name,
        avatar: instructor?.user?.pfpImg
      },
      studentsEnrolled: 0,
      rating: {
        average: 0,
        count: 0,
        total: 0
      },
      status: 'Pending',
      isPrivate: req.body.isPrivate || true,  // = !isPublished
      isDeleted: false,
    });

    await newCourse.save();

    // update drafts (remove expire date)
    const newKeys = getAllVideoKeys(newCourse);
    const keysArray = Array.from(newKeys);
    if (keysArray.length > 0) {
      // make them permanent by removing expireAt
      await DraftVideo.updateMany(
        { key: { $in: keysArray } },
        { $unset: { expireAt: 1 } }
      );
    }

    // update instructor
    instructor.myCourses.push({ course: newCourse._id });
    await instructor.save();

    return res.status(201).json({
      success: true,
      message: 'Course submitted for review successfully!',
      data: newCourse
    });

  } catch (error) {
    console.error('Error creating course:', error);

    // handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
        errors: error.errors
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while creating course'
    });
  }
};

// PUT /api/courses/:id
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const course = await Course.findOne({ _id: id, isDeleted: false });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!course.instructor?.ref?.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You cannot modify this course'
      });
    }

    const validation = validateCourse(req.body);
    if (!validation.success) {
      return res.status(400).json(validation);
    }

    // #TODO: parse in FE not here
    if (req.body.duration !== null) {
      const duration = parseDurationToHours(req.body.duration, req.body.durationUnit);
      if (duration.error) {
        return res.status(400).json({ success: false, message: duration.error });
      }

      req.body.duration = duration.hours;
      req.body.durationUnit = 'hour';
    }

    const oldKeys = getAllVideoKeys(course);  // snapshot old videos

    Object.assign(course, req.body);  // apply update
    course.status = 'Pending';  // update status

    const newKeys = getAllVideoKeys(course);  // get new videos

    // identify video to keep
    const keysToKeep = Array.from(newKeys);
    if (keysToKeep.length > 0) {
      await DraftVideo.updateMany(
        { key: { $in: keysToKeep } },
        { $unset: { expireAt: 1 } }
      );
    }

    // identify videos to remove
    const keysToRemove = Array.from(oldKeys).filter(key => !newKeys.has(key));
    if (keysToRemove.length > 0) {
      const expireDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await DraftVideo.updateMany(
        { key: { $in: keysToRemove } },
        { $set: { expireAt: expireDate } }
      );
    }

    await course.save();

    return res.json({
      success: true,
      message: 'Course updated successfully! Awaiting review.',
      data: course
    });

  } catch (error) {
    console.error('Error updating course:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
        errors: error.errors
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while updating course'
    });
  }
};

// course validation helper
export const validateCourse = (course) => {
  // required fields
  const {
    title,
    category,
    level,
    language,
    price,
    enableDiscount,
    discountPrice,  // optional when enableDiscount = false
    image,
    curriculum
  } = course;

  if (!title || !title.trim()) {
    return { success: false, message: 'Title is required.' };
  }

  if (!category || !category.trim()) {
    return { success: false, message: 'Category is required.' };
  }

  if (!level || !level.trim()) {
    return { success: false, message: 'Level is required.' };
  }

  if (!language || !language.trim()) {
    return { success: false, message: 'Language is required.' };
  }

  if (price == null || price < 0) {
    return { success: false, message: 'A valid price is required.' };
  }

  if (enableDiscount) {
    if (discountPrice == null || discountPrice < 0) {
      return { success: false, message: 'Discount price is required when discount is enabled.' };
    }

    if (discountPrice >= price) {
      return { success: false, message: 'Discount price must be less than the original price.' };
    }
  }

  if (!image || !image.trim()) {
    return { success: false, message: 'Course image is required.' };
  }

  if (!Array.isArray(curriculum) || curriculum.length === 0) {
    return { success: false, message: 'Curriculum cannot be empty.' };
  }

  // #TODO: validation (string, number, etc.) for other fields as needed

  return { success: true };
};

const parseDurationToHours = (duration, durationUnit) => {
  if (isNaN(duration)) {
    return { error: 'Duration must be a number.' };
  }

  if (!durationUnit || !['hour', 'minute', 'second', 'day'].includes(durationUnit)) {
    return { error: 'Duration unit must be one of: hour, minute, second, day.' };
  }

  const durationNum = Number(duration);

  if (durationNum <= 0) {
    return { error: 'Duration must be a positive number.' };
  }

  let hours;
  switch (durationUnit) {
    case 'hour':
      hours = durationNum;
      break;
    case 'minute':
      hours = durationNum / 60;
      break;
    case 'second':
      hours = durationNum / 3600;
      break;
    case 'day':
      hours = durationNum * 24;
      break;
    default:
      return { error: 'Invalid duration unit.' };
  }

  // round to 2 decimals
  return { hours: Math.round(hours * 100) / 100 };
}

// PATCH /api/courses/:id?newStatus=
export const updateCourseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus } = req.query;
    const adminId = req.adminId;

    const admin = await Admin.findById(adminId);
    if (!admin || !admin.isVerified || !admin.isApproved) {
      return res.status(401).json({
        success: false,
        message: 'Access denied'
      });
    }

    const allowedStatus = ['Rejected', 'Pending', 'Live', 'Blocked'];

    if (!allowedStatus.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.status = newStatus;
    await course.save();

    return res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      course
    });
  } catch (error) {
    console.error('Error updating course status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// PATCH /api/courses/:id?setPrivacy=
export const setCoursePrivacy = async (req, res) => {
  try {
    const { id } = req.params;
    const { setPrivacy } = req.query;
    const userId = req.userId;

    const course = await Course.findOne({ _id: id, isDeleted: false });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!course.instructor?.ref?.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: 'You cannot modify this course'
      });
    }

    const value =
      setPrivacy === 'true' ? true :
        setPrivacy === 'false' ? false :
          null;
    if (value === null) {
      return res.status(400).json({
        success: false,
        message: 'Invalid privacy value'
      });
    }

    course.isPrivate = value;
    await course.save();

    return res.status(200).json({
      success: true,
      message: 'Course state updated',
      isPrivate: value
    });
  } catch (error) {
    console.error('Error updating course privacy:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// GET /api/courses/:id/videos/:key
export const streamVideo = async (req, res) => {
  try {
    const { id, key } = req.params;
    const userId = req.userId;

    // check access #TODO

    // check if valid key
    if (!key || !key.trim().startsWith('videos/')) {
      return res.status(400).json({
        success: false,
        message: "Invalid S3 key format"
      });
    }

    // generate url
    const streamUrl = await generateStreamUrl(key);
    
    return res.json({
      success: true,
      streamUrl
    });
  } catch (error) {
    console.error("Generate stream URL error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  } 
};
