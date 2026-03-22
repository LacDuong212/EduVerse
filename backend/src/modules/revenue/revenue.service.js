import AppError from "#exceptions/app.error.js";
import Instructor from "#modules/instructor/instructor.model.js";
import Order, { STATUS_ENUM as ORDER_STATUS } from "#modules/order/order.model.js";

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

export const getCoursesMonthlyEarningByInstructorId = async (insId) => {
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
    { $match: {
        status: ORDER_STATUS.completed,
        createdAt: { $gte: startOfMonth },
        "courses.course": { $in: courseIds }
      }
    },
    { $unwind: "$courses" },
    { $match: {
        "courses.course": { $in: courseIds }
      }
    },
    { $group: {
        _id: "$courses.course",
        totalEarning: { $sum: "$courses.pricePaid" },
        totalSales: { $sum: 1 }
      }
    },
    { $sort: { totalEarning: -1 } },
    { $limit: limit },
    { $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "courseInfo"
      }
    },
    { $unwind: "$courseInfo" },
    { $project: {
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