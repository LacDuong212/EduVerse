import mongoose from "mongoose";
import AppError from "#exceptions/app.error.js";
import Course from "#modules/course/course.model.js";
import Enrollment, { STATUS_ENUM as ENROLL_STATUS } from "#modules/enrollment/enrollment.model.js";
import Instructor from "#modules/instructor/instructor.model.js";
import Order, { STATUS_ENUM as ORDER_STATUS } from "#modules/order/order.model.js";

const INSTRUCTOR_NET_PROFIT = 0.8;

const formatMonthlyData = (dbResults, startDate) => {
  const result = [];
  const current = new Date(startDate);
  const now = new Date();

  while (current <= now) {
    const month = current.getMonth() + 1;
    const year = current.getFullYear();

    const dbMatch = dbResults.find(r => r._id.month === month && r._id.year === year);

    const formattedMonth = month.toString().padStart(2, '0');
    const formattedYear = year.toString().slice(-2);

    result.push({
      period: `${formattedMonth}-${formattedYear}`,
      value: dbMatch ? dbMatch.totalEarnings : 0
    });

    current.setMonth(current.getMonth() + 1);
  }
  return result;
};

export const getAllCoursesMonthlyEarningByInstructorId = async (insId) => {
  if (!insId) throw new AppError("Instructor ID is required.", 400);

  const instructor = await Instructor.findOne({ user: insId, isApproved: true })
    .select("myCourses")
    .lean();
  if (!instructor) throw new AppError("Instructor not found.", 404);

  const courseIds = instructor.myCourses || [];
  if (courseIds.length === 0) return [];

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const earnings = await Order.aggregate([
    {
      $match: {
        status: ORDER_STATUS.completed,
        createdAt: { $gte: twelveMonthsAgo },
        "courses.course": { $in: courseIds }
      }
    },
    { $unwind: "$courses" },
    {
      $match: {
        "courses.course": { $in: courseIds }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        totalEarnings: { $sum: "$courses.pricePaid" }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  return formatMonthlyData(earnings, twelveMonthsAgo);
};

export const getTopEarningCoursesThisMonth = async (insId, limit = 5) => {
  if (!insId) throw new AppError("Instructor ID is required.", 400);

  const instructor = await Instructor.findOne({ user: insId })
    .select("myCourses")
    .lean();
  if (!instructor) throw new AppError("Instructor not found.", 404);

  const courseIds = instructor.myCourses || [];
  if (courseIds.length === 0) return [];

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const topCourses = await Order.aggregate([
    {
      $match: {
        status: ORDER_STATUS.completed,
        createdAt: { $gte: startOfMonth },
        "courses.course": { $in: courseIds }
      }
    },
    { $unwind: "$courses" },
    {
      $match: {
        "courses.course": { $in: courseIds }
      }
    },
    {
      $group: {
        _id: "$courses.course",
        totalEarning: { $sum: "$courses.pricePaid" },
        totalSales: { $sum: 1 }
      }
    },
    { $sort: { totalEarning: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "courseInfo"
      }
    },
    { $unwind: "$courseInfo" },
    {
      $project: {
        _id: 0,

        courseId: "$courseInfo._id",
        title: "$courseInfo.title",
        image: "$courseInfo.image",

        totalEarning: 1,
        totalSales: 1,
      }
    }
  ]);

  return topCourses;
};

export const getCourseMonthlyEarning = async (insId, courseId) => {
  if (!insId) throw new AppError("Instructor ID is required.", 400);

  const course = await Course.findOne({ _id: courseId, isDeleted: false })
    .lean();
  if (!course) throw new AppError("Course not found.", 404);

  if (course.instructor?.ref?.toString() !== insId)
    throw new AppError("You don't have access to this course.", 403);

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const earnings = await Order.aggregate([
    {
      $match: {
        status: ORDER_STATUS.completed,
        createdAt: { $gte: twelveMonthsAgo },
        "courses.course": new mongoose.Types.ObjectId(courseId)
      }
    },
    { $unwind: "$courses" },
    {
      $match: {
        "courses.course": new mongoose.Types.ObjectId(courseId)
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        totalEarnings: { $sum: "$courses.pricePaid" }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  return formatMonthlyData(earnings, twelveMonthsAgo);
};

export const getCourseMonthlyEnrollments = async (insId, courseId) => {
  if (!insId) throw new AppError("Instructor ID is required.", 400);

  const course = await Course.findOne({ _id: courseId, isDeleted: false })
    .lean();
  if (!course) throw new AppError("Course not found.", 404);

  if (course.instructor?.ref?.toString() !== insId)
    throw new AppError("You don't have access to this course.", 403);

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const enrollmentStats = await Enrollment.aggregate([
    {
      $match: {
        course: new mongoose.Types.ObjectId(courseId),
        status: ENROLL_STATUS.active,
        enrolledAt: { $gte: twelveMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$enrolledAt" },
          month: { $month: "$enrolledAt" }
        },
        value: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  return formatMonthlyData(enrollmentStats, twelveMonthsAgo);
};

export const getInstructorEarnings = async (insId) => {
  if (!insId) throw new AppError("Instructor ID is required", 400);

  const instructor = await Instructor.findOne({ user: insId, isApproved: true })
    .select("myCourses")
    .lean();

  if (!instructor) throw new AppError("Instructor not found.", 404);

  const courseIds = instructor.myCourses || [];
  if (courseIds.length === 0) {
    return { earnings: [], totalEarning: 0 };
  }

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const [monthlyData, lifetimeData] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          status: ORDER_STATUS.completed,
          createdAt: { $gte: twelveMonthsAgo },
          "courses.course": { $in: courseIds }
        }
      },
      { $unwind: "$courses" },
      { $match: { "courses.course": { $in: courseIds } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalEarnings: {
            $sum: { $multiply: ["$courses.pricePaid", INSTRUCTOR_NET_PROFIT] }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]),

    Order.aggregate([
      {
        $match: {
          status: ORDER_STATUS.completed,
          "courses.course": { $in: courseIds }
        }
      },
      { $unwind: "$courses" },
      { $match: { "courses.course": { $in: courseIds } } },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$courses.pricePaid", INSTRUCTOR_NET_PROFIT] } }
        }
      }
    ])
  ]);

  return {
    earnings: formatMonthlyData(monthlyData, twelveMonthsAgo),
    totalEarning: lifetimeData[0]?.total || 0
  };
};