import mongoose from "mongoose";
import AppError from "#exceptions/app.error.js";
import Course from "#modules/course/course.model.js";
import Enrollment, { STATUS_ENUM as ENROLL_STATUS } from "#modules/enrollment/enrollment.model.js";
import Instructor from "#modules/instructor/instructor.model.js";
import CourseProgress from "#modules/learning/course-progress.model.js";
import Order, { STATUS_ENUM as ORDER_STATUS } from "#modules/order/order.model.js";

const INSTRUCTOR_NET_PROFIT = 0.8;
const TARGET_PER_CATEGORY = 5;

const formatMonthlyData = (dbResults, startDate) => {
  const result = [];
  const current = new Date(startDate);
  const now = new Date();

  while (current <= now) {
    const month = current.getMonth() + 1;
    const year = current.getFullYear();

    const dbMatch = dbResults.find(r => r._id.month === month && r._id.year === year);

    const formattedMonth = month.toString().padStart(2, '0');
    const formattedYear = year.toString();

    result.push({
      period: `${formattedMonth}-${formattedYear}`,
      value: dbMatch ? dbMatch.value : 0
    });

    current.setMonth(current.getMonth() + 1);
  }
  return result;
};

export const getAllCoursesMonthlyRevenueByInstructorId = async (insId) => {
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

  const [result] = await Order.aggregate([
    {
      $match: {
        status: ORDER_STATUS.completed,
        "courses.course": { $in: courseIds }
      }
    },
    { $unwind: "$courses" },
    { $match: { "courses.course": { $in: courseIds } } },
    {
      $facet: {
        monthly: [
          { $match: { createdAt: { $gte: twelveMonthsAgo } } },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" }
              },
              value: { $sum: "$courses.pricePaid" }
            }
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } }
        ],
        total: [
          { $group: { _id: null, sum: { $sum: "$courses.pricePaid" } } }
        ]
      }
    }
  ]);

  return {
    series: formatMonthlyData(result.monthly || [], twelveMonthsAgo),
    total: result.total[0]?.sum || 0
  };
};

export const getTopRevenueCoursesThisMonth = async (insId, limit = 5) => {
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
        totalRevenue: { $sum: "$courses.pricePaid" },
        totalSales: { $sum: 1 }
      }
    },
    { $sort: { totalRevenue: -1 } },
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

        totalRevenue: 1,
        totalSales: 1,
      }
    }
  ]);

  return topCourses;
};

export const getCourseMonthlyRevenue = async (insId, courseId) => {
  if (!insId) throw new AppError("Instructor ID is required.", 400);

  const course = await Course.findOne({ _id: courseId, isDeleted: false }).lean();
  if (!course || course.instructor?.ref?.toString() !== insId)
    throw new AppError("Course not found or access denied.", 404);

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const [result] = await Order.aggregate([
    {
      $match: {
        status: ORDER_STATUS.completed,
        "courses.course": new mongoose.Types.ObjectId(courseId)
      }
    },
    { $unwind: "$courses" },
    {
      $match: { "courses.course": new mongoose.Types.ObjectId(courseId) }
    },
    {
      $facet: {
        monthly: [
          { $match: { createdAt: { $gte: twelveMonthsAgo } } },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" }
              },
              value: { $sum: "$courses.pricePaid" }
            }
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } }
        ],
        total: [
          { $group: { _id: null, sum: { $sum: "$courses.pricePaid" } } }
        ]
      }
    }
  ]);

  return {
    series: formatMonthlyData(result.monthly || [], twelveMonthsAgo),
    total: result.total[0]?.sum || 0
  };
};

export const getCourseMonthlyEnrollments = async (insId, courseId) => {
  if (!insId) throw new AppError("Instructor ID is required.", 400);

  const course = await Course.findOne({ _id: courseId, isDeleted: false }).lean();
  if (!course || course.instructor?.ref?.toString() !== insId)
    throw new AppError("Course not found or access denied.", 404);

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const [result] = await Enrollment.aggregate([
    {
      $match: {
        course: new mongoose.Types.ObjectId(courseId),
        status: ENROLL_STATUS.active
      }
    },
    {
      $facet: {
        monthly: [
          { $match: { enrolledAt: { $gte: twelveMonthsAgo } } },
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
        ],
        total: [
          { $count: "count" }
        ]
      }
    }
  ]);

  return {
    series: formatMonthlyData(result.monthly || [], twelveMonthsAgo),
    total: result.total[0]?.count || 0
  };
};

export const getInstructorEarnings = async (insId) => {
  if (!insId) throw new AppError("Instructor ID is required", 400);

  const instructor = await Instructor.findOne({ user: insId, isApproved: true })
    .select("myCourses")
    .lean();
  if (!instructor) throw new AppError("Instructor not found.", 404);

  const courseIds = instructor.myCourses || [];

  if (courseIds.length === 0)
    return { series: [], thisMonthRevenue: 0, toBePaid: 0, totalEarning: 0 };

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

  const twelveMonthsAgo = new Date(startOfThisMonth);
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);

  const [result] = await Order.aggregate([
    {
      $match: {
        status: ORDER_STATUS.completed,
        "courses.course": { $in: courseIds }
      }
    },
    { $unwind: "$courses" },
    { $match: { "courses.course": { $in: courseIds } } },
    {
      $facet: {
        monthlyChart: [
          { $match: { createdAt: { $gte: twelveMonthsAgo } } },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" }
              },
              value: { $sum: { $multiply: ["$courses.pricePaid", INSTRUCTOR_NET_PROFIT] } }
            }
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } }
        ],
        currentMonth: [
          { $match: { createdAt: { $gte: startOfThisMonth } } },
          {
            $group: {
              _id: null,
              revenue: { $sum: "$courses.pricePaid" },
              net: { $sum: { $multiply: ["$courses.pricePaid", INSTRUCTOR_NET_PROFIT] } }
            }
          }
        ],
        lifetime: [
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$courses.pricePaid", INSTRUCTOR_NET_PROFIT] } }
            }
          }
        ]
      }
    }
  ]);

  return {
    series: formatMonthlyData(result.monthlyChart || [], twelveMonthsAgo),
    thisMonthRevenue: result.currentMonth[0]?.revenue || 0,
    toBePaid: result.currentMonth[0]?.net || 0,
    totalEarning: result.lifetime[0]?.total || 0,
  };
};

export const getStudentSkillsRadar = async (stuId) => {
  if (!stuId) throw new AppError("Student ID is required.", 400);

  const statsMap = await getCategoryCompletionStats();

  const userStats = statsMap[stuId.toString()] || {};
  const labels = Object.keys(userStats).sort();
  const values = labels.map(cat => userStats[cat]);

  const allUserIds = Object.keys(statsMap);
  const totalUsers = allUserIds.length || 1;

  const systemAvgValues = labels.map(cat => {
    const sum = allUserIds.reduce((total, uid) => total + (statsMap[uid][cat] || 0), 0);
    return Math.round(sum / totalUsers);
  });

  return {
    labels,
    values,
    systemAvgValues,
    raw: {
      student: userStats,
      totalActiveLearners: totalUsers
    }
  };
};

const getCategoryCompletionStats = async () => {
  const pipeline = [
    {
      $match: {
        totalLectures: { $gt: 0 },
        $expr: { $eq: ["$completedLecturesCount", "$totalLectures"] }
      }
    },
    {
      $lookup: {
        from: "courses",
        localField: "course",
        foreignField: "_id",
        as: "courseData"
      }
    },
    { $unwind: "$courseData" },
    {
      $lookup: {
        from: "categories",
        localField: "courseData.category",
        foreignField: "_id",
        as: "categoryData"
      }
    },
    { $unwind: "$categoryData" },
    {
      $group: {
        _id: { userId: "$user", categoryName: "$categoryData.name" },
        completedCount: { $sum: 1 }
      }
    },
    {
      $project: {
        userId: "$_id.userId",
        categoryName: "$_id.categoryName",
        percentage: {
          $min: [
            100,
            { $round: { $divide: [{ $multiply: ["$completedCount", 100] }, TARGET_PER_CATEGORY] } }
          ]
        }
      }
    }
  ];

  const results = await CourseProgress.aggregate(pipeline);

  return results.reduce((acc, progress) => {
    const stuId = progress.userId.toString();
    if (!acc[stuId]) acc[stuId] = {};
    acc[stuId][progress.categoryName] = progress.percentage;
    return acc;
  }, {});
};