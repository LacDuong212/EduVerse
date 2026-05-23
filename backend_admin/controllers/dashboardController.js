import Course from '../models/courseModel.js';
import Instructor from '../models/instructorModel.js';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments(
      { role: 'student', isVerified: true, isActivated: true }
    );

    const insResult = await Instructor.aggregate([
      { $match: { isApproved: true } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData"
        }
      },
      { $unwind: "$userData" },
      {
        $match: {
          "userData.isVerified": true,
          "userData.isActivated": true
        }
      },
      { $count: "total" }
    ]);
    const totalInstructors = insResult.length > 0 ? insResult[0].total : 0;

    const totalCourses = await Course.countDocuments({ isDeleted: false, status: { $ne: 'draft' } });

    const salesData = await Order.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalSales = salesData[0]?.totalSales || 0;

    res.json({
      success: true,
      data: {
        totalStudents,
        totalInstructors,
        totalCourses,
        totalSales
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message
    });
  }
};

export const getEarningsChart = async (req, res) => {
  try {
    const today = new Date();
    const twelveMonthsAgo = new Date(today);
    twelveMonthsAgo.setMonth(today.getMonth() - 12);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const salesData = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          monthlySales: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const chartData = [];
    const monthFormatter = new Intl.DateTimeFormat('en-GB', {
      year: "numeric",
      month: "2-digit",
    });

    let currentDate = new Date(twelveMonthsAgo);

    while (currentDate <= today) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const foundMonth = salesData.find(d => d._id.year === year && d._id.month === month);

      chartData.push({
        x: monthFormatter.format(currentDate),
        y: foundMonth ? foundMonth.monthlySales : 0
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    res.json({
      success: true,
      data: {
        series: [{ name: 'Revenue', data: chartData }]
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch earnings chart",
      error: error.message
    });
  }
};