import mongoose from "mongoose";
import AppError from "#exceptions/app.error.js";
import Course from "#modules/course/course.model.js";
import Enrollment, { STATUS_ENUM as ENROLL_STATUS } from "#modules/enrollment/enrollment.model.js";
import Instructor from "#modules/instructor/instructor.model.js";
import CourseProgress from "#modules/learning/course-progress.model.js";
import Order, { STATUS_ENUM as ORDER_STATUS } from "#modules/order/order.model.js";
import Payout from "#modules/payout/payout.model.js";

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
              net: { $sum: { $multiply: ["$courses.pricePaid", INSTRUCTOR_NET_PROFIT] } }
            }
          }
        ],
        lifetime: [
          {
            $group: {
              _id: null,
              totalNet: { $sum: { $multiply: ["$courses.pricePaid", INSTRUCTOR_NET_PROFIT] } },
            }
          }
        ]
      }
    }
  ]);

  const totalEarning     = result.lifetime[0]?.totalNet ?? 0;
  const thisMonthEarning = result.currentMonth[0]?.net  ?? 0;

  const [paidOutAgg] = await Payout.aggregate([
    {
      $match: {
        instructor: new mongoose.Types.ObjectId(insId),
        status: "paid",
        isDeleted: false,
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalPaidOut = paidOutAgg?.total ?? 0;
  const toBePaid = Math.max(0, totalEarning - totalPaidOut);

  return {
    series: formatMonthlyData(result.monthlyChart || [], twelveMonthsAgo),
    thisMonthEarning,
    toBePaid,
    totalEarning,
  };
};

export const getStudentSkillsRadar = async (stuId) => {
  if (!stuId) throw new AppError("Student ID is required.", 400);

  const { statsMap, platformTotals } = await getCategoryCompletionStats();

  const userEntry = statsMap[stuId.toString()] || {};

  // Labels from ALL users so system avg is always populated
  const allCategories = new Set();
  Object.values(statsMap).forEach(catMap =>
    Object.keys(catMap).forEach(cat => allCategories.add(cat))
  );
  const labels = [...allCategories].sort();
  const values = labels.map(cat => userEntry[cat]?.pct ?? 0);

  const allUserIds = Object.keys(statsMap);
  const totalUsers  = allUserIds.length || 1;

  const systemAvgValues = labels.map(cat => {
    const sum = allUserIds.reduce((total, uid) => total + (statsMap[uid][cat]?.pct || 0), 0);
    return Math.round(sum / totalUsers);
  });

  // Raw lecture counts for tooltip display on the frontend
  const lectureData = {};
  labels.forEach(cat => {
    lectureData[cat] = {
      completed: userEntry[cat]?.completed ?? 0,
      total:     platformTotals[cat] ?? 0,
    };
  });

  return {
    labels,
    values,
    systemAvgValues,
    raw: {
      lectureData,
      totalActiveLearners: totalUsers,
    }
  };
};

/**
 * Get instructor's enrollment trends for past 30 days
 * Returns daily enrollment data
 */
export const getInstructorEnrollmentTrends = async (insId) => {
  if (!insId) throw new AppError("Instructor ID is required.", 400);

  const instructor = await Instructor.findOne({ user: insId, isApproved: true })
    .select("myCourses")
    .lean();
  if (!instructor) throw new AppError("Instructor not found.", 404);

  const courseIds = instructor.myCourses || [];
  if (courseIds.length === 0) return { series: [], total: 0 };

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [result] = await Enrollment.aggregate([
    {
      $match: {
        course: { $in: courseIds },
        enrolledAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $facet: {
        daily: [
          {
            $group: {
              _id: {
                year: { $year: "$enrolledAt" },
                month: { $month: "$enrolledAt" },
                day: { $dayOfMonth: "$enrolledAt" }
              },
              value: { $sum: 1 }
            }
          },
          { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ],
        total: [
          { $count: "count" }
        ]
      }
    }
  ]);

  // Format daily data
  const series = [];
  const current = new Date(thirtyDaysAgo);
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  while (current <= now) {
    const year = current.getFullYear();
    const month = current.getMonth() + 1;
    const day = current.getDate();

    const dbMatch = (result.daily || []).find(
      r => r._id.year === year && r._id.month === month && r._id.day === day
    );

    const dateStr = current.toISOString().split('T')[0]; // YYYY-MM-DD
    series.push({
      date: dateStr,
      value: dbMatch ? dbMatch.value : 0
    });

    current.setDate(current.getDate() + 1);
  }

  return {
    series,
    total: result.total[0]?.count || 0
  };
};

/**
 * Get breakdown of student enrollment status
 * Returns count by status: active, completed, refunded
 */
export const getStudentProgressBreakdown = async (insId) => {
  if (!insId) throw new AppError("Instructor ID is required.", 400);

  const instructor = await Instructor.findOne({ user: insId, isApproved: true })
    .select("myCourses")
    .lean();
  if (!instructor) throw new AppError("Instructor not found.", 404);

  const courseIds = instructor.myCourses || [];
  if (courseIds.length === 0) {
    return {
      statusBreakdown: [
        { status: "active", count: 0, percentage: 0 },
        { status: "completed", count: 0, percentage: 0 },
        { status: "refunded", count: 0, percentage: 0 },
        { status: "inactive", count: 0, percentage: 0 }
      ],
      total: 0
    };
  }

  const results = await Enrollment.aggregate([
    {
      $match: {
        course: { $in: courseIds }
      }
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  const total = results.reduce((sum, r) => sum + r.count, 0);
  const statusMap = results.reduce((acc, r) => {
    acc[r._id] = r.count;
    return acc;
  }, {});

  const statusBreakdown = [
    { status: "active", count: statusMap.active || 0 },
    { status: "completed", count: statusMap.completed || 0 },
    { status: "refunded", count: statusMap.refunded || 0 },
    { status: "inactive", count: statusMap.inactive || 0 }
  ].map(item => ({
    ...item,
    percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
  }));

  return {
    statusBreakdown,
    total
  };
};

/**
 * Get student distribution across instructor's courses
 */
export const getStudentDistributionByCourse = async (insId, limit = 10) => {
  if (!insId) throw new AppError("Instructor ID is required.", 400);

  const instructor = await Instructor.findOne({ user: insId, isApproved: true })
    .select("myCourses")
    .lean();
  if (!instructor) throw new AppError("Instructor not found.", 404);

  const courseIds = instructor.myCourses || [];
  if (courseIds.length === 0) return [];

  const distribution = await Enrollment.aggregate([
    {
      $match: {
        course: { $in: courseIds },
        status: ENROLL_STATUS.active
      }
    },
    {
      $group: {
        _id: "$course",
        studentCount: { $sum: 1 }
      }
    },
    { $sort: { studentCount: -1 } },
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
        courseName: "$courseInfo.title",
        studentCount: 1
      }
    }
  ]);

  return distribution;
};

const getCategoryCompletionStats = async () => {
  const categoryLookup = [
    { $lookup: { from: "courses",    localField: "course",            foreignField: "_id", as: "courseData" } },
    { $unwind: "$courseData" },
    { $lookup: { from: "categories", localField: "courseData.category", foreignField: "_id", as: "categoryData" } },
    { $unwind: "$categoryData" },
  ];

  // Phase 1 — platform-wide lecture total per category (deduplicated by course)
  const platformResults = await CourseProgress.aggregate([
    { $match: { totalLectures: { $gt: 0 } } },
    { $group: { _id: "$course", totalLectures: { $max: "$totalLectures" } } },
    { $lookup: { from: "courses",    localField: "_id",              foreignField: "_id", as: "courseData" } },
    { $unwind: "$courseData" },
    { $lookup: { from: "categories", localField: "courseData.category", foreignField: "_id", as: "categoryData" } },
    { $unwind: "$categoryData" },
    { $group: { _id: "$categoryData.name", platformLectures: { $sum: "$totalLectures" } } },
  ]);

  const platformTotals = platformResults.reduce((acc, r) => {
    acc[r._id] = r.platformLectures;
    return acc;
  }, {});

  // Phase 2 — per-user completed lectures per category
  const userResults = await CourseProgress.aggregate([
    { $match: { totalLectures: { $gt: 0 } } },
    ...categoryLookup,
    {
      $group: {
        _id: { userId: "$user", categoryName: "$categoryData.name" },
        completedLectures: { $sum: "$completedLecturesCount" },
      }
    },
  ]);

  // Phase 3 — percentage = completedLectures / platformTotal × 100
  const statsMap = userResults.reduce((acc, row) => {
    const uid          = row._id.userId.toString();
    const cat          = row._id.categoryName;
    const platformTotal = platformTotals[cat] || 1;
    if (!acc[uid]) acc[uid] = {};
    acc[uid][cat] = {
      pct:       Math.min(100, Math.round((row.completedLectures / platformTotal) * 100)),
      completed: row.completedLectures,
    };
    return acc;
  }, {});

  return { statsMap, platformTotals };
};