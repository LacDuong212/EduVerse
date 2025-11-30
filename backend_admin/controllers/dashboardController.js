import User from '../models/userModel.js';
import Course from '../models/courseModel.js';
import Order from '../models/orderModel.js';


export const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalInstructors = await User.countDocuments({ role: 'instructor' });

    const totalCourses = await Course.countDocuments();

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

    const monthLabels = [];
    const salesValues = [];
    const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' });

    let currentDate = new Date(twelveMonthsAgo);

    while (currentDate <= today) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      monthLabels.push(`${monthFormatter.format(currentDate)} ${year}`);

      const foundMonth = salesData.find(d => d._id.year === year && d._id.month === month);
      salesValues.push(foundMonth ? foundMonth.monthlySales : 0);

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    res.json({
      success: true,
      data: {
        series: [{ name: 'Earnings', data: salesValues }],
        categories: monthLabels
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