import Fuse from "fuse.js";
import mongoose from "mongoose";
import Instructor from "../models/instructorModel.js";
import { TYPE_ENUM as NOTIF_TYPE } from "../models/notificationModel.js";
import User, { ROLE_ENUM as USER_ROLE } from "../models/userModel.js";
import { SUPPORT_EMAIL } from "../utils/constants.js";
import { notifyUsers, createNotifications } from "../utils/notification.js";

export const getAllInstructors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const search = req.query.search?.trim() || "";

    const instructorDocs = await User
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

// GET api/instructors/requests
export const getInstructorRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search?.trim() || "";

    const pendingDocs = await Instructor
      .find({ isApproved: false })
      .populate('user', 'name email pfpImg role')
      .sort({ createdAt: -1 });

    let formattedRequests = pendingDocs
      .filter(doc => doc.user?.role === USER_ROLE.student)
      .map((doc) => {
        const obj = doc.toObject();
        return {
          _id: obj._id,
          name: obj.user.name,
          email: obj.user.email,
          pfpImg: obj.user.pfpImg,
          createdAt: obj.createdAt,
        };
      });

    let results = formattedRequests;

    if (search) {
      const fuse = new Fuse(formattedRequests, {
        keys: ["name", "email"],
        threshold: 0.4,
        distance: 100,
        includeScore: true,
      });

      const fuzzyResults = fuse.search(search);
      results = fuzzyResults.map((r) => r.item);
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
      message: "Failed to fetch instructor requests",
      error: error.message,
    });
  }
};

// PATCH api/instructors/:id/block
export const blockInstructor = async (req, res) => {
  let session = null;
  try {
    const { id } = req.params || {};
    const { message = null } = req.body || {};

    const admin = req.admin;
    if (!admin || !admin.isVerified || !admin.isApproved) {
      return res.status(401).json({ success: false, message: 'Access denied.' });
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const instructor = await User
      .findOne({ _id: id, role: USER_ROLE.instructor, isActivated: true })
      .session(session);

    if (!instructor) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Active instructor account not found or already blocked.'
      });
    }

    instructor.isActivated = false;
    await instructor.save({ session });

    const defaultMsg = 'Your instructor account has been temporarily blocked by an administrator.';
    const notiMsg = `${defaultMsg}${message ? `\n\nReason: “${message}”.` : ''}\nIf you believe this was an error, please email <${SUPPORT_EMAIL}> for support.`;

    await createNotifications([id], NOTIF_TYPE.blocked, notiMsg, session);

    await session.commitTransaction();
    session.endSession();
    session = null;

    try {
      await notifyUsers({ userIds: [id] });
    } catch (notifyErr) {
      console.error('[Block Instructor]: Real-time notification delivery failed (non-critical):', notifyErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Instructor has been successfully blocked.',
      data: { _id: id }
    });

  } catch (error) {
    if (session) await session.abortTransaction();

    console.error('Error handling block instructor:', error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  } finally {
    if (session) await session.endSession();
  }
};

// PATCH api/instructors/:id/unblock
export const unblockInstructor = async (req, res) => {
  let session = null;
  try {
    const { id } = req.params || {};
    const { message = null } = req.body || {};

    const admin = req.admin;
    if (!admin || !admin.isVerified || !admin.isApproved) {
      return res.status(401).json({ success: false, message: 'Access denied.' });
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const instructor = await User
      .findOne({ _id: id, role: USER_ROLE.instructor, isActivated: false })
      .session(session);

    if (!instructor) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Blocked instructor account not found or already unblocked.'
      });
    }

    instructor.isActivated = true;
    await instructor.save({ session });

    const defaultMsg = 'Great news! Your instructor account has been successfully unblocked by an administrator. You can now access your dashboard as normal.';
    const notiMsg = `${defaultMsg}${message ? `\nNote from Admin: “${message}”.` : ''}\nIf you have any questions, please contact <${SUPPORT_EMAIL}> for support.`;

    await createNotifications([id], NOTIF_TYPE.info, notiMsg, session);

    await session.commitTransaction();
    session.endSession();
    session = null;

    try {
      await notifyUsers({ userIds: [id] });
    } catch (notifyErr) {
      console.error('[Unblock Instructor]: Real-time notification delivery failed (non-critical):', notifyErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Instructor has been successfully unblocked.',
      data: { _id: id }
    });

  } catch (error) {
    if (session) await session.abortTransaction();

    console.error('Error handling unblock instructor:', error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  } finally {
    if (session) await session.endSession();
  }
};

// PATCH api/instructors/:id/approve
export const approveInstructor = async (req, res) => {
  let session = null;
  try {
    const { id } = req.params || {};
    const { message = null } = req.body || {};

    const admin = req.admin;
    if (!admin || !admin.isVerified || !admin.isApproved)
      return res.status(401).json({ success: false, message: 'Access denied.' });

    session = await mongoose.startSession();
    session.startTransaction();

    const instructor = await Instructor
      .findOne({ _id: id, isApproved: false })
      .session(session);

    if (!instructor) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Instructor application not found or already approved.'
      });
    }

    instructor.isApproved = true;
    await instructor.save({ session });

    const userId = (instructor.user?._id || instructor.user)?.toString();
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { role: USER_ROLE.instructor } },
      { session, new: true }
    );

    if (!updatedUser) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Associated user account could not be found.'
      });
    }

    const defaultMsg = 'Congratulations! Your instructor application has been approved. You can now create courses.';
    const notiMsg = `${defaultMsg}${message ? `\nReason: “${message}”.` : ''}\nIf you have any questions please email <${SUPPORT_EMAIL}> for support!`;

    await createNotifications([userId], NOTIF_TYPE.approved, notiMsg, session);

    await session.commitTransaction();
    session.endSession();
    session = null;

    try {
      await notifyUsers({ userIds: [userId] });
    } catch (notifyErr) {
      console.error('[Approve Instructor]: Real-time notification delivery failed (non-critical):', notifyErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Instructor has been successfully approved.',
      data: { _id: id }
    });

  } catch (error) {
    if (session) await session.abortTransaction();

    console.error('Error handling instructor approval:', error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  } finally {
    if (session) await session.endSession();
  }
};

// DELETE api/instructors/:id/reject
export const rejectInstructor = async (req, res) => {
  let session = null;
  try {
    const { id } = req.params || {};
    const { message = null } = req.body || {};

    const admin = req.admin;
    if (!admin || !admin.isVerified || !admin.isApproved) {
      return res.status(401).json({ success: false, message: 'Access denied.' });
    }

    session = await mongoose.startSession();
    session.startTransaction();


    const instructorRequest = await Instructor
      .findOne({ _id: id, isApproved: false })
      .session(session);

    if (!instructorRequest) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Instructor application request not found or already processed.'
      });
    }

    const userId = (instructorRequest.user?._id || instructorRequest.user)?.toString();

    await Instructor.deleteOne({ _id: id }).session(session);

    const defaultMsg = 'Thank you for your interest in teaching on our platform. After careful review, your instructor application has been declined.';
    const notiMsg = `${defaultMsg}${message ? `\nReason: “${message}”.` : ''}\nIf you have any questions or wish to appeal this decision, please reach out to <${SUPPORT_EMAIL}> for details.`;

    await createNotifications([userId], NOTIF_TYPE.rejected, notiMsg, session);

    await session.commitTransaction();
    session.endSession();
    session = null;

    try {
      await notifyUsers({ userIds: [userId] });
    } catch (notifyErr) {
      console.error('[Reject Instructor]: Real-time notification delivery failed (non-critical):', notifyErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Instructor application request has been successfully rejected and removed.',
      data: { _id: id }
    });

  } catch (error) {
    if (session) await session.abortTransaction();

    console.error('Error handling reject instructor:', error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  } finally {
    if (session) await session.endSession();
  }
};

export const getInstructorStatsById = async (req, res) => {
  try {
    const admin = req.admin;

    if (!admin || !admin.isVerified || !admin.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const { id } = req.params || {};

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Instructor ID is required.",
      });
    }

    const instructor = await Instructor.findOne({ user: id }).lean();

    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found.",
      });
    }

    const {
      totalStudents = 0,
      totalReviews = 0,
      ratingSum = 0,
    } = instructor.stats || {};

    const totalCourses = instructor.myCourses?.length || 0;

    const averageRating =
      totalReviews > 0
        ? Number((ratingSum / totalReviews).toFixed(1))
        : 0;

    return res.status(200).json({
      success: true,
      message: "Get instructor stats successfully.",
      result: {
        totalCourses,
        totalStudents,
        totalReviews,
        averageRating,
      },
    });
  } catch (error) {
    console.error("Failed to fetch instructor stats:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch instructor stats.",
      error: error.message,
    });
  }
};