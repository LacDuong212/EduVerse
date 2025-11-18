import Course from "../models/courseModel.js";
import Instructor from "../models/instructorModel.js";
import Order from "../models/orderModel.js";
import userModel from "../models/userModel.js";
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

export const updateInstructor = async (req, res) => {

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

export const getAllInstructors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const search = req.query.search?.trim() || "";

    const instructorDocs = await userModel
      .find(
        { role: 'instructor' },
        'name email isVerified isActivated createdAt updatedAt pfpImg'
      )
      .sort({ createdAt: -1 });

    const instructors = instructorDocs.map((doc) => doc.toObject());

    let results = instructors;
    if (search) {
      const fuse = new Fuse(instructors, {
        keys: ["name", "email"],
        threshold: 0.4,
        distance: 100,
        includeScore: true,
      });

      const fuzzyResults = fuse.search(search);
      results = fuzzyResults.map(r => r.item);
    }

    const total = results.length;
    const paginated = results.slice((page - 1) * limit, page * limit);

    res.json({
      success: true,
      data: paginated,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch instructors",
      error: error.message,
    });
  }
};

// PATCH /user/instructors/:id/block
export const blockInstructor = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedInstructor = await userModel.findOneAndUpdate(
      { _id: id, role: 'instructor' },
      { isActivated: false },
      { new: true }
    );

    if (!updatedInstructor) {
      return res.status(404).json({ success: false, message: "Instructor not found" });
    }

    res.json({ success: true, data: updatedInstructor });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to block instructor",
      error: error.message,
    });
  }
};

// PATCH /user/instructors/:id/unblock
export const unblockInstructor = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedInstructor = await userModel.findOneAndUpdate(
      { _id: id, role: 'instructor' },
      { isActivated: true },
      { new: true }
    );

    if (!updatedInstructor) {
      return res.status(404).json({ success: false, message: "Instructor not found" });
    }

    res.json({ success: true, data: updatedInstructor });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to unblock instructor",
      error: error.message,
    });
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

// Helper: get date ranges and Mongo formats
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

  // Convert Mongo array to Object Map for fast lookup
  // Ex: { "2023-11-18": 500, "2023-11-19": 200 }
  const dataMap = {};
  mongoData.forEach(item => {
    dataMap[item._id] = item.total;
  });

  // Loop until we pass today
  // Note: We use a "buffer" in the while loop to ensure we catch the current bucket
  while (current <= now || (unit === 'week' && current.getTime() < now.getTime() + 604800000)) {
    let label = "";
    
    if (unit === 'day') {
      label = current.toISOString().slice(0, 10); // "2023-11-18"
      results.push({ name: label, value: dataMap[label] || 0 });
      // Increment 1 Day
      current.setDate(current.getDate() + 1);
    } 
    else if (unit === 'week') {
      // Get ISO Week number manually for JS to match Mongo's %V
      // This is a bit tricky in pure JS, so we use a simplified key generator
      // Trick: We let Mongo drive the keys, but for the "Empty" loop, 
      // we might just approximate or rely on the library.
      
      // Simple Approach: Use a helper to format JS date to "%Y-%V"
      const year = current.getFullYear();
      const oneJan = new Date(current.getFullYear(), 0, 1);
      const numberOfDays = Math.floor((current - oneJan) / (24 * 60 * 60 * 1000));
      const weekNum = Math.ceil((current.getDay() + 1 + numberOfDays) / 7);
      const weekString = weekNum.toString().padStart(2, '0');
      
      label = `${year}-${weekString}`; // "2023-46"
      
      // If Mongo returned "2023-46", we match it. 
      // Note: ISO week calculation is complex. If this drifts, 
      // use a library like date-fns or moment in production.
      
      // Fallback check: Does dataMap have a key that looks like this week?
      const foundValue = dataMap[label] || 0;

      results.push({ name: `Week ${weekString}`, value: foundValue });
      
      // Increment 7 Days
      current.setDate(current.getDate() + 7);
      if (results.length >= 4) break; // Hard limit to 4 weeks as requested
    } 
    else if (unit === 'month') {
      label = current.toISOString().slice(0, 7); // "2023-11"
      results.push({ name: label, value: dataMap[label] || 0 });
      // Increment 1 Month
      current.setMonth(current.getMonth() + 1);
    } 
    else if (unit === 'year') {
      label = current.getFullYear().toString(); // "2023"
      results.push({ name: label, value: dataMap[label] || 0 });
      // Increment 1 Year
      current.setFullYear(current.getFullYear() + 1);
    }
  }

  return results;
};
