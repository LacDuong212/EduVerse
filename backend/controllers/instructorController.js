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

export const getInstructorCourses = async (req, res) => {
  try {
    const userId = req.userId;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find instructor by user ref
    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor) {
      return res.status(404).json({ success: false, message: 'Instructor not found' });
    }

    // Get list of course IDs from instructor's myCourses
    const courseIds = instructor.myCourses.map((c) => c.course);

    const total = courseIds.length;

    // Fetch courses with pagination
    const courses = await Course.find({ _id: { $in: courseIds } })
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate active/inactive counts from ALL courses (not just paged)
    const allCourses = await Course.find({ _id: { $in: courseIds } }).lean();

    const totalActive = allCourses.filter(c => c.isActive && c.status === "Live").length;
    const totalInactive = total - totalActive;

    return res.status(200).json({
      success: true,
      data: courses,
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