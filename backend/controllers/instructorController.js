import Instructor from '../models/instructorModel.js';
import Course from "../models/courseModel.js";
import userModel from "../models/userModel.js";
import Fuse from 'fuse.js';


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
