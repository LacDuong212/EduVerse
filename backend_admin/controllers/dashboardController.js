import Category from '../models/categoryModel.js';
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
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const salesData = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: sixMonthsAgo }
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

    let currentDate = new Date(sixMonthsAgo);

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

export const getUserGrowthChart = async (req, res) => {
  try {
    const today = new Date();
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const rawData = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, isVerified: true } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            role: '$role'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthFormatter = new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: '2-digit' });
    const categories = [];
    const studentData = [];
    const instructorData = [];

    let currentDate = new Date(sixMonthsAgo);
    while (currentDate <= today) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      categories.push(monthFormatter.format(currentDate));

      const studentEntry = rawData.find(d => d._id.year === year && d._id.month === month && d._id.role === 'student');
      const instructorEntry = rawData.find(d => d._id.year === year && d._id.month === month && d._id.role === 'instructor');
      studentData.push(studentEntry ? studentEntry.count : 0);
      instructorData.push(instructorEntry ? instructorEntry.count : 0);

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    res.json({
      success: true,
      data: {
        categories,
        series: [
          { name: 'Students', data: studentData },
          { name: 'Instructors', data: instructorData }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user growth chart', error: error.message });
  }
};

export const getCourseStatusChart = async (req, res) => {
  try {
    const statusCounts = await Course.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statusOrder = ['pending', 'live', 'blocked', 'rejected', 'draft'];
    const labels = [];
    const series = [];

    statusOrder.forEach(status => {
      const found = statusCounts.find(s => s._id === status);
      if (found) {
        labels.push(status.charAt(0).toUpperCase() + status.slice(1));
        series.push(found.count);
      }
    });

    res.json({ success: true, data: { labels, series } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch course status chart', error: error.message });
  }
};

export const getTopCoursesChart = async (req, res) => {
  try {
    const topCourses = await Course.find(
      { isDeleted: false, status: 'live' },
      { title: 1, studentsEnrolled: 1, rating: 1 }
    )
      .sort({ studentsEnrolled: -1 })
      .limit(10)
      .lean();

    const categories = topCourses.map(c => c.title.length > 38 ? c.title.slice(0, 35) + '...' : c.title);
    const enrollmentData = topCourses.map(c => c.studentsEnrolled);
    // rating is stored as { count, total, stars } — average is derived, not a field.
    const ratingData = topCourses.map(c => {
      const count = c.rating?.count || 0;
      const total = c.rating?.total || 0;
      return count > 0 ? parseFloat((total / count).toFixed(1)) : 0;
    });

    res.json({
      success: true,
      data: {
        categories,
        series: [
          { name: 'Enrolled Students', type: 'bar', data: enrollmentData },
          { name: 'Rating', type: 'line', data: ratingData }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch top courses chart', error: error.message });
  }
};

export const getMonthlyEnrollmentsChart = async (req, res) => {
  try {
    const today = new Date();
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const rawData = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      { $unwind: '$courses' },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthFormatter = new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: '2-digit' });
    const chartData = [];
    let currentDate = new Date(sixMonthsAgo);
    while (currentDate <= today) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const found = rawData.find(d => d._id.year === year && d._id.month === month);
      chartData.push({ x: monthFormatter.format(currentDate), y: found ? found.count : 0 });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    res.json({ success: true, data: { series: [{ name: 'Enrollments', data: chartData }] } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch monthly enrollments chart', error: error.message });
  }
};

export const getOrderStatusChart = async (req, res) => {
  try {
    const statusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const labelMap = { completed: 'Completed', pending: 'Pending', refunded: 'Refunded', cancelled: 'Cancelled' };
    const colorMap = { Completed: '#22c55e', Pending: '#f59e0b', Refunded: '#3b82f6', Cancelled: '#ef4444' };
    const statusOrder = ['completed', 'pending', 'refunded', 'cancelled'];

    const labels = [];
    const series = [];
    statusOrder.forEach(s => {
      const found = statusCounts.find(d => d._id === s);
      if (found) {
        labels.push(labelMap[s]);
        series.push(found.count);
      }
    });

    res.json({ success: true, data: { labels, series } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order status chart', error: error.message });
  }
};

export const getCoursesByCategoryChart = async (req, res) => {
  try {
    const rawData = await Course.aggregate([
      { $match: { isDeleted: false, status: { $ne: 'draft' }, category: { $ne: null } } },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryData'
        }
      },
      { $unwind: '$categoryData' },
      {
        $group: {
          _id: '$categoryData.name',
          totalEnrolled: { $sum: '$studentsEnrolled' },
          courseCount: { $sum: 1 }
        }
      },
      { $sort: { totalEnrolled: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        series: [{
          data: rawData.map(d => ({
            x: d._id,
            y: d.totalEnrolled,
            courseCount: d.courseCount
          }))
        }]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch courses by category chart', error: error.message });
  }
};

export const getTopInstructorsByRevenueChart = async (req, res) => {
  try {
    const rawData = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$courses' },
      {
        $lookup: {
          from: 'courses',
          localField: 'courses.course',
          foreignField: '_id',
          as: 'courseData'
        }
      },
      { $unwind: '$courseData' },
      {
        $group: {
          _id: '$courseData.instructor.ref',
          instructorName: { $first: '$courseData.instructor.name' },
          totalRevenue: { $sum: '$courses.pricePaid' }
        }
      },
      { $match: { instructorName: { $ne: null } } },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    const categories = rawData.map(d => d.instructorName || 'Unknown');
    const data = rawData.map(d => d.totalRevenue);

    res.json({
      success: true,
      data: {
        series: [{ name: 'Revenue', data }],
        categories
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch top instructors by revenue chart', error: error.message });
  }
};
