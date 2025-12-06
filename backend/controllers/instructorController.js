import Course from "../models/courseModel.js";
import CourseProgress from "../models/courseProgressModel.js";
import DraftVideo from "../models/draftVideoModel.js";
import Instructor from "../models/instructorModel.js";
import Order from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Review from "../models/reviewModel.js";

import { generateUploadUrl } from "../utils/aws/putObject.js";

import Fuse from "fuse.js";
import mongoose from "mongoose";


const fetchInstructorFields = async (filter, fields, allowedFields) => {
  const selectFields = fields
    ? fields
      .split(',')
      .filter((f) => allowedFields.includes(f))
      .join(' ')
    : '';

  return Instructor.findOne(filter).select(selectFields);
};

// helper: get course ids for an instructor
const getInstructorCourseIds = async (userId) => {
  const courses = await Course.find(
    { "instructor.ref": userId, isDeleted: false },
    '_id'
  ).lean();

  return courses.map(course => course._id);
};

// helper: get student ids for an instructor
const getInstructorStudentIds = async (userId) => {
  const courseIds = await getInstructorCourseIds(userId);
  const orders = await Order.find(
    {
      status: 'completed',
      "courses.course": { $in: courseIds }
    },
    'user'
  ).lean();
  const studentIdSet = new Set(orders.map(order => order.user.toString()));
  return Array.from(studentIdSet).map(id => new mongoose.Types.ObjectId(id));
}

// helper: get date ranges and Mongo formats
const getDateConfig = (period) => {
  const now = new Date();
  const start = new Date();

  let mongoFormat = ""; // How Mongo formats the date string (grouping ID)
  let unit = "";        // How we step through the loop (day, week, month, year)

  switch (period) {
    case 'day': // "Past 7 Days"
      start.setDate(now.getDate() - 6); // Go back 6 days + today = 7 days
      start.setHours(0, 0, 0, 0);
      mongoFormat = "%Y-%m-%d"; // "2023-11-18"
      unit = 'day';
      break;

    case 'week': // "Past 4 Weeks"
      start.setDate(now.getDate() - 28); // Approx 4 weeks ago
      start.setHours(0, 0, 0, 0);
      // Group by Year and ISO Week number (e.g., "2023-46")
      mongoFormat = "%Y-%V";
      unit = 'week';
      break;

    case 'month': // "Past 12 Months"
      start.setMonth(now.getMonth() - 11); // Go back 11 months + current = 12
      start.setDate(1); // Start from 1st of that month
      start.setHours(0, 0, 0, 0);
      mongoFormat = "%Y-%m"; // "2023-11"
      unit = 'month';
      break;

    case 'year': // "Past 4 Years"
      start.setFullYear(now.getFullYear() - 3); // Go back 3 years + current = 4
      start.setMonth(0, 1); // Start Jan 1st
      start.setHours(0, 0, 0, 0);
      mongoFormat = "%Y"; // "2023"
      unit = 'year';
      break;

    default: // Default to 7 days
      start.setDate(now.getDate() - 6);
      mongoFormat = "%Y-%m-%d";
      unit = 'day';
  }

  return { start, mongoFormat, unit };
};

// helper: fill in missing dates with 0
const fillChartData = (mongoData, start, unit) => {
  const results = [];
  const current = new Date(start);
  const now = new Date();

  const dataMap = {};
  if (Array.isArray(mongoData)) {
    mongoData.forEach(item => {
      dataMap[item._id.month] = item.totalEarnings || item.total || 0;
    });
  }

  const pad = (num) => num.toString().padStart(2, '0');

  while (current <= now || (unit === 'week' && current.getTime() < now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
    let label = "";
    let shouldBreak = false;

    if (unit === 'day') {
      // Format: YYYY-MM-DD (Local Time)
      const year = current.getFullYear();
      const month = pad(current.getMonth() + 1);
      const day = pad(current.getDate());
      label = `${year}-${month}-${day}`;

      results.push({ name: label, value: dataMap[label] || 0 });

      // Tăng 1 ngày
      current.setDate(current.getDate() + 1);
    }

    else if (unit === 'month') {
      // Format: YYYY-MM (Local Time)
      const year = current.getFullYear();
      const month = pad(current.getMonth() + 1);
      label = `${year}-${month}`;

      results.push({ name: label, value: dataMap[label] || 0 });

      // Tăng 1 tháng
      current.setMonth(current.getMonth() + 1);
    }

    else if (unit === 'year') {
      // Format: YYYY
      label = current.getFullYear().toString();
      results.push({ name: label, value: dataMap[label] || 0 });

      // Tăng 1 năm
      current.setFullYear(current.getFullYear() + 1);
    }

    else if (unit === 'week') {
      // Logic tính tuần thủ công để khớp với Mongo %V
      const year = current.getFullYear();
      const oneJan = new Date(year, 0, 1);
      const numberOfDays = Math.floor((current - oneJan) / (24 * 60 * 60 * 1000));
      const weekNum = Math.ceil((current.getDay() + 1 + numberOfDays) / 7);
      const weekString = pad(weekNum);

      // Label khớp với Mongo: "2025-47"
      label = `${year}-${weekString}`;

      // Tìm trong map, nếu không có thử check label dạng "Week X" (tuỳ nhu cầu hiển thị)
      // Ở đây ta ưu tiên key khớp với Mongo ID
      const foundValue = dataMap[label] || 0;

      // Hiển thị ra UI là "Week 47" cho đẹp
      results.push({ name: `Week ${weekString}`, value: foundValue });

      // Tăng 7 ngày
      current.setDate(current.getDate() + 7);

      // Logic break an toàn: Nếu ngày current mới đã vượt quá xa tương lai
      if (current > new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
        shouldBreak = true;
      }
      // Limit cứng 4-5 tuần nếu cần thiết (như code cũ của bạn)
      // if (results.length >= 5) shouldBreak = true;
    }

    // Check thoát vòng lặp thủ công nếu cần
    if (shouldBreak) break;

    // Safety check: Tránh vòng lặp vô tận nếu logic tăng ngày bị lỗi
    if (results.length > 3660) break; // Max 10 năm days
  }

  return results;
};


// GET /api/instructors/:id?fields=field1,field2,...
export const getPublicFields = async (req, res) => {
  try {
    const { id } = req.params;
    const { fields } = req.query;

    const allowedFields = [
      'stats',
      'rating',
      'myCourses',
      'introduction',
      'address',
      'skills',
      'education',
      'occupation'
    ];

    const instructor = await fetchInstructorFields({ user: id }, fields, allowedFields);

    if (!instructor) {
      return res.status(404).json({ success: false, message: 'Instructor not found' });
    }

    res.json({ success: true, instructor });
  } catch (error) {
    console.error('Error fetching public fields:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch instructor data' });
  }
};

// GET /api/instructor?fields=field1,field2,...
export const getPrivateFields = async (req, res) => {
  try {
    const { fields } = req.query;
    const userId = req.userId;

    const allowedFields = [
      'linkedAccounts',
      'myStudents',
      'enrollments'
    ];

    const instructor = await fetchInstructorFields({ user: userId }, fields, allowedFields);

    if (!instructor) {
      return res.status(404).json({ success: false, message: 'Instructor not found' });
    }

    res.json({ success: true, instructor });
  } catch (error) {
    console.error('Error fetching private fields:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch instructor data' });
  }
};

// POST /api/instructors
export const createInstructor = async (req, res) => {
  try {
    const userId = req.userId;

    // prevent duplicate instructors for same user
    const existing = await Instructor.findOne({ userId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered as an instructor.'
      });
    }

    // create instructor
    const instructor = new Instructor({ user: userId });
    await instructor.save();

    // change role in userModel
    const user = await userModel.findById(userId);
    if (user) {
      user.role = 'instructor';
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Instructor created successfully.',
      instructor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while creating instructor.',
      error: error.message
    });
  }
};

// GET /api/instructor/courses?page=&limit=&search=&sort=
export const getInstructorCourses = async (req, res) => {
  try {
    const userId = req.userId;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = req.query.search || '';
    const sortParam = req.query.sort || '';

    // find instructor by user ref
    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor) {
      return res.status(404).json({ success: false, message: 'Instructor not found' });
    }

    // fetch all courses for the instructor
    const allCourses = await Course.find({ "instructor.ref": userId, isDeleted: false }).lean();

    // sorting function helper
    const sortFunctions = {
      '': (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),        // default: updatedAt desc
      'newest': (a, b) => new Date(b.createdAt) - new Date(a.createdAt),  // createdAt desc
      'oldest': (a, b) => new Date(a.createdAt) - new Date(b.createdAt),  // createdAt asc
      'mostPopular': (a, b) => (b.studentsEnrolled || 0) - (a.studentsEnrolled || 0), // desc
      'leastPopular': (a, b) => (a.studentsEnrolled || 0) - (b.studentsEnrolled || 0), // asc
      'highestRating': (a, b) => (b.rating?.average || 0) - (a.rating?.average || 0), // desc
      'lowestRating': (a, b) => (a.rating?.average || 0) - (b.rating?.average || 0),  // asc
    };
    // fallback to default sort if invalid
    const sortFn = sortFunctions[sortParam] || sortFunctions[''];

    let filteredCourses = allCourses;

    // filter by searchTerm first
    if (searchTerm.trim() !== '') {
      const fuse = new Fuse(allCourses, {
        keys: ['title', 'subtitle', 'description', 'category', 'subCategory', 'tags'],
        threshold: 0.3,
      });
      filteredCourses = fuse.search(searchTerm).map(result => result.item);
    }

    // then sort the filtered list
    filteredCourses.sort(sortFn);

    // total count after search filter
    const total = filteredCourses.length;

    // sort the filtered results
    filteredCourses.sort((a, b) => {
      if (sortParam === 'updatedAt') {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
      if (sortParam === 'createdAt') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });

    // paginate
    const pagedCourses = filteredCourses.slice(skip, skip + limit);

    const totalActive = filteredCourses.filter(c => !c.isPrivate && c.status === "Live").length;
    const totalInactive = total - totalActive;

    return res.status(200).json({
      success: true,
      data: pagedCourses,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      totalActive,
      totalInactive,
    });
  } catch (err) {
    console.error('Error fetching instructor courses:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/instructor/courses/:id
export const getMyCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const course = await Course.findOne({ _id: id, isDeleted: false }).lean();
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (!course.instructor?.ref?.equals(userId)) {
      return res.status(403).json({ success: false, message: "Cannot access this course" });
    }

    return res.json({ success: true, course });
  } catch (error) {
    console.error(`Error fetching instructor course with id(${req.params.id}):`, error);
    return res.status(500).json({ success: false, message: "Cannot get instructor's course" });
  }
};

// GET /api/instructor/courses/:id/earnings?period=["day","week","month","year"]
export const getCourseEarnings = async (req, res) => {
  try {
    const { id } = req.params;
    const { period } = req.query; // "day","week","month","year"
    const userId = req.userId;

    // validate ownership
    const course = await Course.findOne({ _id: id, isDeleted: false }).select('instructor');
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    if (!course.instructor?.ref?.equals(userId)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // setup date logic
    const { start, mongoFormat, unit } = getDateConfig(period);

    // aggregation pipeline
    const earnings = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: start }, // filter by calculated start date
          "courses.course": new mongoose.Types.ObjectId(id)
        }
      },
      { $unwind: "$courses" },
      {
        $match: {
          "courses.course": new mongoose.Types.ObjectId(id)
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: mongoFormat, date: "$createdAt" } },
          total: { $sum: "$courses.pricePaid" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // fill gaps (empty days/hours)
    const chartData = fillChartData(earnings, start, unit);

    return res.json({
      success: true,
      data: chartData,
      totalEarnings: earnings.reduce((acc, curr) => acc + curr.total, 0)
    });
  } catch (error) {
    console.error(`Error fetching earnings for course (${req.params.id}):`, error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET /api/instructor/courses/:id/studentsEnrolled?period=["day","week","month","year"]
export const getStudentsEnrolled = async (req, res) => {
  try {
    const { id } = req.params;
    const { period } = req.query; // "day","week","month","year"
    const userId = req.userId;

    // validate ownership
    const course = await Course.findOne({ _id: id, isDeleted: false }).select('instructor');
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    if (!course.instructor?.ref?.equals(userId)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // setup date logic
    const { start, mongoFormat, unit } = getDateConfig(period);

    // aggregation pipeline
    const enrollments = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: start },
          "courses.course": new mongoose.Types.ObjectId(id)
        }
      },
      // Unwind is strictly safer to ensure we count the specific course instance
      { $unwind: "$courses" },
      {
        $match: {
          "courses.course": new mongoose.Types.ObjectId(id)
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: mongoFormat, date: "$createdAt" } },
          total: { $sum: 1 } // <--- CHANGE: Count 1 instead of summing price
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // fill gaps
    const chartData = fillChartData(enrollments, start, unit);

    const totalCount = enrollments.reduce((acc, curr) => acc + curr.total, 0);

    return res.json({
      success: true,
      data: chartData,
      totalEnrolled: totalCount
    });
  } catch (error) {
    console.error(`Error fetching enrollments for course (${req.params.id}):`, error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// GET /api/instructor/courses/:id/students?page=&limit=&search=
export const getCourseStudentsAndReviews = async (req, res) => {
  try {
    const id = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const keyword = req.query.search || '';
    const userId = req.userId;

    // verify instructor
    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const course = await Course.findById(id);

    // check if course exist
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // check ownership
    if (!course?.instructor?.ref?.equals(userId)) {
      return res.status(403).json({ success: false, message: "Cannot access this course" });
    }

    // get students (from order)
    const students = await Order.aggregate([
      { $match: { status: "completed" } },  // filter out unrelated orders
      { $unwind: "$courses" },  // from { abc, courses: [course: A, course: B] } to {abc, course: {course: A}}, {abc, couses: {course: B}}
      { $match: { "courses.course": new mongoose.Types.ObjectId(id) } },  // filter out unrelated courses
      { // get student info
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },
      { // get student review
        $lookup: {
          from: "reviews",
          let: { userId: "$user", courseId: "$courses.course" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user", "$$userId"] },
                    { $eq: ["$course", "$$courseId"] },
                    { $eq: ["isDeleted", false] }
                  ]
                }
              }
            },
            {
              $project: {
                _id: 0,
                rating: 1,
                description: 1,
                updatedAt: 1,
              }
            }
          ],
          as: "review"
        }
      },
      { // shaping what to return
        $project: {
          _id: 0,
          student: {
            _id: "$student._id",
            name: "$student.name",
            email: "$student.email",
            pfpImg: "$student.pfpImg",
            enrolledAt: "$updatedAt"
          },
          review: { $ifNull: [{ $arrayElemAt: ["$review", 0] }, null] }  // get first review or null (only 1 review/user/course)
        }
      }
    ]);

    // get student progress and percentage #TODO
    for (let i = 0; i < students.length; i++) students[i].student.progress = 0;

    let filtered = students;

    // search
    if (keyword) {
      const fuse = new Fuse(students, {
        keys: ["student.name"],
        threshold: 0.3
      });

      filtered = fuse.search(keyword).map(i => i.item);
    }

    // paging
    const total = filtered.length;
    const paged = filtered.slice(skip, skip + limit);

    return res.json({
      success: true,
      students: paged,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get course student review: ", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching students and reviews"
    });
  }
};

// GET /api/instructor/counters
export const getInstructorCounters = async (req, res) => {
  try {
    const userId = req.userId;

    const isInstructor = await Instructor.exists({ user: userId });
    if (!isInstructor) {
      return res.status(403).json({ success: false, message: "You don't have access to this resource" });
    }

    const courseIds = await getInstructorCourseIds(userId);
    const studentIds = await getInstructorStudentIds(userId);

    const totalCourses = courseIds.length
    const totalStudents = studentIds.length;

    const totalOrders = await Order.countDocuments({
      status: 'completed',
      "courses.course": { $in: courseIds }
    });

    if (courseIds.length === 0) {
      return res.json({
        success: true,
        averageRating: 0,
        totalCourses,
        totalStudents,
        totalOrders
      });
    }

    // get average rating ---
    const avgRating = await Review.aggregate([
      {
        $match: {
          course: { $in: courseIds },
          isDeleted: false,
        }
      },
      { $sort: { createdAt: -1 } },
      { // remove duplicates: keep only the *latest* review for each (course, user)
        $group: {
          _id: { course: "$course", user: "$user" },
          latestReview: { $first: "$$ROOT" }
        }
      },
      { // extract rating
        $project: {
          rating: "$latestReview.rating"
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const averageRating =
      avgRating.length > 0 && avgRating[0].avgRating != null
        ? parseFloat(avgRating[0].avgRating.toFixed(1))
        : 0;

    return res.json({
      success: true,
      averageRating,
      totalCourses,
      totalStudents,
      totalOrders
    });
  } catch (error) {
    console.error("Populate instructor dashboard data error: ", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// GET /api/instructor/dashboard
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.userId;

    const isInstructor = await Instructor.exists({ user: userId });
    if (!isInstructor) {
      return res.status(403).json({ success: false, message: "You don't have access to this resource" });
    }

    const courseIds = await getInstructorCourseIds(userId);

    if (courseIds.length === 0) {
      return res.json({
        success: true,
        earningsData: [],
        topCoursesData: []
      });
    }

    // time config ---
    const { start, mongoFormat, unit } = getDateConfig('month');

    // get earings ---
    const earnings = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: start }, // e.g. 12 months ago, first day of month
          "courses.course": { $in: courseIds },  // courseIds is array of instructor's course _ids
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
            month: { $dateToString: { format: mongoFormat, date: "$createdAt" } }
          },
          totalEarnings: { $sum: "$courses.pricePaid" }
        }
      },
      { $sort: { "_id.month": 1 } }
    ]);

    const earningsData = fillChartData(earnings, start, unit);

    // get top courses ---
    const topCourses = await Order.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: start },
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
          totalEarnings: { $sum: "$courses.pricePaid" },
          totalSales: { $sum: 1 }
        }
      },
      { $sort: { totalEarnings: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course"
        }
      },
      { $unwind: "$course" },
      {
        $project: {
          _id: 0,
          courseId: "$_id",
          title: "$course.title",
          totalEarnings: 1,
          totalSales: 1
        }
      }
    ]);

    return res.json({
      success: true,
      earningsData,
      topCoursesData: topCourses
    });
  } catch (error) {
    console.error("Populate instructor dashboard data error: ", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// POST /api/instructor/videos/upload
export const generateVideoUploadUrl = async (req, res) => {
  try {
    const userId = req.userId;

    // check instructor
    const isInstructor = await Instructor.exists({ user: userId });
    if (!isInstructor) {
      return res.status(403).json({ success: false, message: "You don't have permission" });
    }

    const { fileName, contentType } = req.body;

    // basic validation
    if (!fileName || !contentType) {
      return res.status(400).json({
        success: false,
        message: "Missing file name or content type"
      });
    }

    // extension validation
    const allowedExt = ["mp4", "mov", "mkv", "avi"];
    const ext = fileName.split(".").pop().toLowerCase();

    if (!allowedExt.includes(ext)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type"
      });
    }

    // sanitize: replaces spaces and special chars with dashes to avoid S3 URL encoding issues
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._]/g, "_");

    // prefix key: videos/{instructorId}/{timestamp}-{safeName}
    const fileKey = `videos/${userId}/${Date.now()}-${safeFileName}`;

    // generate signed URL
    const { uploadUrl, key } = await generateUploadUrl(fileKey, contentType);

    // tracking draft
    await DraftVideo.create({
      key: key,
      contentType: contentType,
    });

    res.json({
      success: true,
      uploadUrl,
      key
    });

  } catch (error) {
    console.error("Generate upload URL error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// GET /api/instructor/profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const instructor = await Instructor.findOne({ user: userId }).populate("user");
    if (!instructor) {
      res.status(404).json({ success: false, message: "Instructor not found" });
    }

    return res.json({
      success: true,
      instructor: {
        id: instructor.user?._id,
        name: instructor.user?.name,
        email: instructor.user?.email,
        pfpImg: instructor.user?.pfpImg || '',
        phonenumber: instructor.user?.phonenumber || '',
        website: instructor.user?.website || '',
        socials: {
          facebook: instructor.user?.socials?.facebook || '',
          twitter: instructor.user?.socials?.twitter || '',
          instagram: instructor.user?.socials.instagram || '',
          youtube: instructor.user?.socials.youtube || '',
        },
        introduction: instructor.introduction || '',
        address: instructor.address || '',
        occupation: instructor.occupation || '',
        skills: instructor.skills || [],
        education: instructor.education || [],
        isApproved: instructor.isApproved || false,
      }
    });

  } catch (error) {
    res.status(400).json({ success: false, message: "Server Error" });
  }
};

// PUT /api/instructor/profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const payload = req.body;

    const errors = [];

    if (!payload.name || payload.name.trim() === "") {
      errors.push("Name is required");
    }
    if (!payload.occupation || payload.occupation.trim() === "") {
      errors.push("Occupation is required");
    }

    if (payload.phonenumber && payload.phonenumber.trim() !== "") {
      const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
      if (!phoneRegex.test(payload.phonenumber)) {
        errors.push("Invalid phone number format");
      }
    }

    if (payload.education && Array.isArray(payload.education) && payload.education.length > 0) {
      payload.education.forEach((edu, index) => {
        if (!edu.institution || edu.institution.trim() === "") {
          errors.push(`Education item #${index + 1}: Institution is required`);
        }
        if (!edu.fieldOfStudy || edu.fieldOfStudy.trim() === "") {
          errors.push(`Education item #${index + 1}: Field of Study is required`);
        }
      });
    }

    if (payload.skills && Array.isArray(payload.skills) && payload.skills.length > 0) {
      payload.skills.forEach((skill, index) => {
        if (!skill.name || skill.name.trim() === "") {
          errors.push(`Skill item #${index + 1}: Name is required`);
        }
        if (skill.level === undefined || skill.level === null || skill.level < 0 || skill.level > 100) {
          errors.push(`Skill item #${index + 1}: Level must be between 0 and 100`);
        }
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors
      });
    }

    const userUpdates = {
      name: payload.name,
      phonenumber: payload.phonenumber,
      website: payload.website,
      socials: payload.socials,
      pfpImg: payload.pfpImg,
    };

    const instructorUpdates = {
      occupation: payload.occupation,
      address: payload.address,
      introduction: payload.introduction,
      education: payload.education,
      skills: payload.skills,
    };

    const [updatedUser, updatedInstructor] = await Promise.all([
      userModel.findByIdAndUpdate(userId, { $set: userUpdates }),
      Instructor.findOneAndUpdate({ user: userId }, { $set: instructorUpdates })
    ]);

    if (!updatedUser || !updatedInstructor) {
      return res.status(404).json({ success: false, message: "Cannot find profile" });
    }

    const combinedProfile = {
      ...updatedInstructor.toObject(),
      user: updatedUser.toObject()
    };

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      //instructor: combinedProfile,
    });

  } catch (error) {
    console.error("Update instructor profile error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/instructor/students?page=&limit=&search=&sort=
export const getInstructorStudents = async (req, res) => {
  try {
    const userId = req.userId;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = req.query.search || "";
    const sortParam = req.query.sort || "";

    const instructorExists = await Instructor.exists({ user: userId });
    if (!instructorExists) {
      return res.status(404).json({ success: false, message: "Instructor not found" });
    }

    const courseIds = await getInstructorCourseIds(userId);
    const studentIds = await getInstructorStudentIds(userId);

    const studentsRaw = await userModel.find({ _id: { $in: studentIds } })
      .select("name email pfpImg isActivated").lean();

    const orders = await Order.find({
      user: { $in: studentIds },
      status: "completed",
      "courses.course": { $in: courseIds }
    }).select("user courses").lean();

    const courseCountMap = {};

    orders.forEach(order => {
      const studentIdStr = order.user.toString();
      order.courses.forEach(item => {
        if (courseIds.some(id => id.toString() === item.course.toString())) {
           courseCountMap[studentIdStr] = (courseCountMap[studentIdStr] || 0) + 1;
        }
      });
    });

    let allStudents = studentsRaw.map(student => ({
      id: student._id,
      name: student.name,
      email: student.email,
      pfpImg: student.pfpImg,
      isActivated: student.isActivated,
      coursesJoined: courseCountMap[student._id.toString()] || 0
    }));

    if (searchTerm.trim() !== '') {
      const fuse = new Fuse(allStudents, {
        keys: ['name'],
        threshold: 0.3,
      });
      allStudents = fuse.search(searchTerm).map(result => result.item);
    }

    const sortFunctions = {
      '': (a, b) => 0,
      'nameAsc': (a, b) => a.name.localeCompare(b.name), // A - Z
      'nameDesc': (a, b) => b.name.localeCompare(a.name), // Z - A
    };

    const sortFn = sortFunctions[sortParam] || sortFunctions[''];
    allStudents.sort(sortFn);

    const total = allStudents.length;
    const totalActive = allStudents.filter(s => s.isActivated).length;
    const totalInactive = total - totalActive;

    const pagedStudents = allStudents.slice(skip, skip + limit);

    return res.status(200).json({ 
      success: true, 
      students: pagedStudents, // data
      total,
      page,
      totalPages: Math.ceil(total / limit),
      totalActive,
      totalInactive,
    });

  } catch (error) {
    console.error('Error fetching instructor students:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/instructor/earnings
export const getInstructorEarnings = async (req, res) => {
  try {
    const userId = req.userId;

    const isInstructor = await Instructor.exists({ user: userId });
    if (!isInstructor) {
      return res.status(403).json({ success: false, message: "You don't have access to this resource" });
    }

    const courseIds = await getInstructorCourseIds(userId);

    if (courseIds.length === 0) {
      return res.json({
        success: true,
        earningsData: [],
        totalEarning: 0
      });
    }

    // get life time earnings ---
    const lifetimeAggregation = await Order.aggregate([
      {
        $match: {
          status: 'completed',
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
          _id: null,
          total: { $sum: "$courses.pricePaid" }
        }
      }
    ]);

    const lifeTimeEarnings = lifetimeAggregation[0]?.total || 0;

    // time config ---
    const { start, mongoFormat, unit } = getDateConfig('month');

    // get earings ---
    const earnings = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: start },
          "courses.course": { $in: courseIds },
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
            month: { $dateToString: { format: mongoFormat, date: "$createdAt" } }
          },
          totalEarnings: { $sum: "$courses.pricePaid" }
        }
      },
      { $sort: { "_id.month": 1 } }
    ]);

    const earningsData = fillChartData(earnings, start, unit);

    // get this month earnings ---
    const thisMonthEarnings = earningsData.length > 0 ? earningsData[earningsData.length - 1].value : 0;
    
    // res ---
    return res.json({
      success: true,
      earningsData,
      thisMonthEarnings,
      toBePaid: thisMonthEarnings * 0.8,        // platform takes 20%
      lifeTimeEarnings: lifeTimeEarnings * 0.8  // net profit
    });
  } catch (error) {
    console.error("Populate instructor dashboard data error: ", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
