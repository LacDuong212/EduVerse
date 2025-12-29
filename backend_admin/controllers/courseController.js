import Course from "../models/courseModel.js";
import Fuse from "fuse.js";
import axios from "axios";

export const getCoursesOverview = async (req, res) => {
  try {
    const admin = req.admin;
    if (!admin || !admin.isVerified || !admin.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Account not verified or approved",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const search = req.query.search?.trim() || "";

    const coursesDocs = await Course.find({ isDeleted: false })
      .select("image thumbnail title instructor level createdAt price status isPrivate")
      .populate("instructor", "name email avatar")
      .sort({ createdAt: -1 })
      .lean();

    let results = coursesDocs;

    const totalCoursesReal = coursesDocs.length;
    const activatedCourses = coursesDocs.filter(c => c.status === "Live").length;
    const pendingCourses = coursesDocs.filter(c => c.status === "Pending").length;
    const rejectedCourses = coursesDocs.filter(c => c.status === "Rejected").length;
    const blockedCourses = coursesDocs.filter(c => c.status === "Blocked").length;

    if (search) {
      const fuse = new Fuse(results, {
        keys: ["title", "instructor.name", "instructor.email"],
        threshold: 0.4,
        distance: 100,
        includeScore: true,
      });

      const fuzzyResults = fuse.search(search);
      results = fuzzyResults.map((r) => r.item);
    }

    const total = results.length;
    const paginated = results.slice((page - 1) * limit, page * limit);

    res.status(200).json({
      success: true,
      data: paginated,
      meta: {
        totalCourses: total,
        totalCoursesReal,
        activatedCourses,
        pendingCourses,
        rejectedCourses,
        blockedCourses,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/courses/:id?newStatus=
export const updateCourseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus } = req.query;

    const admin = req.admin;
    if (!admin || !admin.isVerified || !admin.isApproved) {
      return res.status(401).json({
        success: false,
        message: 'Access denied'
      });
    }

    const allowedStatus = ['Rejected', 'Pending', 'Live', 'Blocked'];

    if (!newStatus || !allowedStatus.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status provided'
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.status === newStatus) {
      return res.status(200).json({ success: true, message: 'Status unchanged', course });
    }

    course.status = newStatus;

    if (newStatus === 'Live' && !course.publishedAt) {
      course.publishedAt = new Date();
    }

    await course.save();

    // TODO: Gửi email thông báo cho Instructor

    try {
      let notiType = 'INFO';
      // Default message
      let notiMessage = `The status of your course "${course.title}" has been updated to ${newStatus}.`;

      // Customize message based on status
      if (newStatus === 'Live') {
        notiType = 'APPROVED';
        notiMessage = `Congratulations! Your course "${course.title}" has been approved and is now live.`;
      } else if (newStatus === 'Rejected') {
        notiType = 'REJECTED';
        notiMessage = `Your course "${course.title}" has been rejected. Please review our feedback and try again.`;
      } else if (newStatus === 'Blocked') {
        notiType = 'BLOCKED';
        notiMessage = `Warning: Your course "${course.title}" has been blocked due to policy violation.`;
      } else if (newStatus === 'Pending') {
        notiType = 'INFO';
        notiMessage = `Your course "${course.title}" has been set back to Pending status.`;
      }

      // Get safe Instructor ID
      let rawId = course.instructor?.ref || course.instructor?._id || course.instructor;

      // Chuyển đổi sang String để đảm bảo không gửi Object (ObjectId) sang bên kia
      const instructorId = String(rawId);

      console.log("Final Instructor ID (String):", instructorId);

      // Call User Backend API
      await axios.post(`${process.env.BACKEND_USER}/api/internal/notify`, {
        userId: instructorId,
        type: notiType,
        message: notiMessage
      });

      console.log(`[AdminBE] Sent notification to UserBE for instructor: ${instructorId}`);

    } catch (notifyError) {
      console.error('[AdminBE] Failed to send notification:', notifyError.message);
    }

    return res.status(200).json({
      success: true,
      message: `Course updated to ${newStatus} successfully`,
      course
    });
  } catch (error) {
    console.error('Error updating course status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};