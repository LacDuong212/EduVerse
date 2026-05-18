import axios from "axios";
import Fuse from "fuse.js";
import mongoose from "mongoose";
import Course, { STATUS_ENUM as COURSE_STATUS, UPDATE_STATUS_ENUM as UPDATE_STATUS } from "../models/courseModel.js";
import Curriculum from "../models/curriculumModel.js";
import DraftVideo from "../models/draftVideoModel.js";
import { TYPE_ENUM as NOTIF_TYPE } from "../models/notificationModel.js";
import { toCourseDto, toCourseDtoList } from "../utils/mapper.js";
import { notifyUser } from "../utils/notification.js";
import { withTransaction } from "../utils/transaction.js";
import Instructor from "../models/instructorModel.js";

const SUPPORT_EMAIL = "lduongwinf@gmail.com";

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

    const coursesDocs = await Course.find({ status: { $ne: 'draft' } })
      .populate("category", "name")
      .populate("instructor.ref", "name email pfpImg")
      .sort({ updatedAt: -1 })
      .lean();

    let results = coursesDocs;

    const statusCounts = COURSE_STATUS.values().reduce((acc, status) => {
      acc[status] = 0;
      return { ...acc, deleted: 0 };
    }, {});

    coursesDocs.forEach(course => {
      if (!course.isDeleted) {
        if (statusCounts.hasOwnProperty(course.status))
          statusCounts[course.status]++;
      } else if (course.status !== COURSE_STATUS.draft) {
        statusCounts.deleted++;
      }
    });

    if (search) {
      const fuse = new Fuse(results, {
        keys: ["title", "instructor.ref.name", "instructor.ref.email"],
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
      data: toCourseDtoList(paginated),
      meta: {
        totalCourses: total,
        totalCoursesReal: coursesDocs?.length,
        liveCourses: statusCounts[COURSE_STATUS.live],
        pendingCourses: statusCounts[COURSE_STATUS.pending],
        rejectedCourses: statusCounts[COURSE_STATUS.rejected],
        blockedCourses: statusCounts[COURSE_STATUS.blocked],
        deletedCourses: statusCounts.deleted,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/courses/:id/status
export const updateCourseStatus = async (req, res) => {
  let session = null;

  try {
    const { id } = req.params || {};
    const { newValue, message = null } = req.body || {};

    const admin = req.admin;
    if (!admin || !admin.isVerified || !admin.isApproved)
      return res.status(401).json({ success: false, message: 'Access denied.' });

    const allowedStatus = [
      COURSE_STATUS.blocked,
      COURSE_STATUS.pending,
      COURSE_STATUS.rejected
    ];

    if (!newValue || !allowedStatus.includes(newValue))
      return res.status(400).json({ success: false, message: 'Invalid status provided.' });

    session = await mongoose.startSession();
    session.startTransaction();

    const course = await Course
      .findOne({ _id: id, status: { $ne: COURSE_STATUS.draft }, isDeleted: false })
      .session(session);

    if (!course) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    if (course.status === newValue) {
      await session.abortTransaction();
      return res.status(200).json({ success: true, message: 'Course status unchanged.' });
    }

    course.previousStatus = course.status;
    course.status = newValue;

    await course.save({ session });

    let notiType = NOTIF_TYPE.info;

    switch (newValue) {
      case COURSE_STATUS.pending:
        notiType = NOTIF_TYPE.info;
        break;
      case COURSE_STATUS.rejected:
        notiType = NOTIF_TYPE.rejected;
        break;
      case COURSE_STATUS.blocked:
        notiType = NOTIF_TYPE.blocked;
        break;
    }

    const insId = (course.instructor?.ref?._id || course.instructor?.ref)?.toString();

    await notifyUser({
      userId: insId,
      type: notiType,
      message: `The status of your course "${course.title}" has been updated from [${course.previousStatus?.toUpperCase()}] to [${newValue?.toUpperCase()}].${message ? `\nReason: “${message}”.` : ''}\nIf you have any question please email <${SUPPORT_EMAIL}> for support!`
    });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: `Course status changed to ${newValue}.`,
    });
  } catch (error) {
    if (session) await session.abortTransaction();

    console.error('Error updating course status:', error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  } finally {
    if (session) await session.endSession();
  }
};

// DELETE /api/courses/:id
export const softDeleteCourse = async (req, res) => {
  let session = null;
  try {
    const { id } = req.params || {};
    const { message = null } = req.body || {};

    const admin = req.admin;
    if (!admin || !admin.isVerified || !admin.isApproved)
      return res.status(401).json({ success: false, message: 'Access denied.' });

    session = await mongoose.startSession();
    session.startTransaction();

    const course = await Course
      .findOne({ _id: id, status: { $ne: COURSE_STATUS.draft }, isDeleted: false })
      .session(session);

    if (!course) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Course not found, already deleted, or cannot be processed.'
      });
    }

    const insId = course.instructor?.ref?._id || course.instructor?.ref;
    const instructor = await Instructor.findOne({ user: insId, isApproved: true })
      .session(session);

    // if (!instructor) {
    //   await session.abortTransaction();
    //   return res.status(404).json({
    //     success: false,
    //     message: 'Instructor not found, course deletion suspended.'
    //   });
    // }

    course.isDeleted = true;
    await course.save({ session });

    if (instructor) {
      instructor.myCourses?.pull(course._id);
      instructor.stats.totalCourses = instructor.myCourses?.length || 0;
      await instructor.save({ session });

      await notifyUser({
        userId: insId?.toString(),
        type: NOTIF_TYPE.blocked,
        message: `Your course "${course.title}" has been deleted by an administrator.${message ? `\nReason: “${message}”.` : ''}\nIf you have any questions please email <${SUPPORT_EMAIL}> for support!`
      });
    }

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: 'Course has been successfully deleted.'
    });
  } catch (error) {
    if (session) await session.abortTransaction();

    console.error('Error handling soft delete course:', error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  } finally {
    if (session) await session.endSession();
  }
};

// PATCH /api/courses/:id/restore
export const restoreCourse = async (req, res) => {
  let session = null;
  try {
    const { id } = req.params || {};
    const { message = null } = req.body || {};

    const admin = req.admin;
    if (!admin || !admin.isVerified || !admin.isApproved)
      return res.status(401).json({ success: false, message: 'Access denied.' });

    session = await mongoose.startSession();
    session.startTransaction();

    const course = await Course
      .findOne({ _id: id, status: { $ne: COURSE_STATUS.draft }, isDeleted: true })
      .session(session);

    if (!course) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Course not found, not deleted, or cannot be restored.'
      });
    }

    const insId = course.instructor?.ref?._id || course.instructor?.ref;
    const instructor = await Instructor.findOne({ user: insId, isApproved: true })
      .session(session);

    if (!instructor) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Instructor not found, course restoration suspended.'
      });
    }

    course.isDeleted = false;
    await course.save({ session });

    const courseIdStr = course._id.toString();

    const alreadyHasCourse = instructor.myCourses?.some(id => id.toString() === courseIdStr);

    if (!alreadyHasCourse)
      instructor.myCourses.push(course._id);

    instructor.stats.totalCourses = instructor.myCourses?.length || 0;
    await instructor.save({ session });

    await notifyUser({
      userId: insId?.toString(),
      type: NOTIF_TYPE.info,
      message: `Your course "${course.title}" has been restored by an administrator.${message ? `\nReason: “${message}”.` : ''}\nIf you have any questions please email <${SUPPORT_EMAIL}> for support!`
    });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: 'Course has been successfully restored.'
    });
  } catch (error) {
    if (session) await session.abortTransaction();

    console.error('Error handling restore course:', error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  } finally {
    if (session) await session.endSession();
  }
};

// PATCH /api/courses/:id/unblock
export const unblockCourse = async (req, res) => {
  let session = null;
  try {
    const { id } = req.params || {};
    const { message = null } = req.body || {};

    const admin = req.admin;
    if (!admin || !admin.isVerified || !admin.isApproved)
      return res.status(401).json({ success: false, message: 'Access denied.' });

    session = await mongoose.startSession();
    session.startTransaction();

    const course = await Course
      .findOne({ _id: id, status: COURSE_STATUS.blocked, isDeleted: false })
      .session(session);

    if (!course) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Blocked course not found or already unblocked.'
      });
    }

    const targetStatus = course.previousStatus || COURSE_STATUS.pending;

    course.previousStatus = course.status;
    course.status = targetStatus;

    await course.save({ session });

    const insId = (course.instructor?.ref?._id || course.instructor?.ref)?.toString();

    await notifyUser({
      userId: insId,
      type: NOTIF_TYPE.info,
      message: `Your course "${course.title}" has been unblocked and reverted back to [${targetStatus.toUpperCase()}] status.\nIf you have any questions please email <${SUPPORT_EMAIL}> for support!`
    });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: `Course has been successfully unblocked and reverted to [${targetStatus.toUpperCase()}] status.${message ? `\nReason: “${message}”.` : ''}`,
      result: {
        status: course.status,
        previousStatus: course.previousStatus
      }
    });
  } catch (error) {
    if (session) await session.abortTransaction();

    console.error('Error handling unblock course:', error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  } finally {
    if (session) await session.endSession();
  }
};

// PATCH /api/courses/:id/approve
export const approveCourse = async (req, res) => {
  let session = null;
  try {
    const { id } = req.params || {};

    const admin = req.admin;
    if (!admin || !admin.isVerified || !admin.isApproved)
      return res.status(401).json({ success: false, message: 'Access denied.' });

    session = await mongoose.startSession();
    session.startTransaction();

    const course = await Course.findOne({ _id: id, isDeleted: false }).session(session);
    const curriculum = await Curriculum.findOne({ courseId: id }).session(session);

    if (!course || !curriculum) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Unable to obtain course details.' });
    }

    const coursePending = course.pendingUpdate?.status === UPDATE_STATUS.pending;
    const currPending = curriculum.pendingUpdate?.status === UPDATE_STATUS.pending;
    const underReview = course.status === COURSE_STATUS.pending;

    if (!coursePending && !currPending && !underReview) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Nothing to approve.' });
    }

    const extractVideoIds = (sections) =>
      [...new Set((sections || []).flatMap(s => s?.lectures || []).map(l => l?.videoId).filter(Boolean))];

    const oldVids = [
      course.previewVideo,
      course.pendingUpdate?.data?.previewVideo,
      ...extractVideoIds(curriculum.sections),
      ...extractVideoIds(curriculum.pendingUpdate?.data?.sections)
    ];

    if (currPending) {
      curriculum.sections = curriculum.pendingUpdate.data?.sections || curriculum.sections;
      curriculum.pendingUpdate = { data: null, submittedAt: null, status: UPDATE_STATUS.none };

      course.sectionsCount = curriculum.sections.length;
      course.lecturesCount = curriculum.sections.reduce((acc, sec) => acc + (sec.lectures?.length || 0), 0);
      course.duration = curriculum.sections.reduce((acc, sec) =>
        acc + (sec.lectures?.reduce((sum, lec) => sum + Number(lec.duration || 0), 0) || 0), 0
      );

      curriculum.markModified('sections');
      await curriculum.save({ session });
    }

    if (coursePending || underReview) {
      const updates = course.pendingUpdate?.data || {};
      course.previousStatus = course.status;
      course.set(updates);
      course.pendingUpdate = { data: null, submittedAt: null, status: UPDATE_STATUS.none };
    }

    course.status = COURSE_STATUS.live;
    await course.save({ session });

    const newVids = [
      course.previewVideo,
      ...extractVideoIds(curriculum.sections)
    ];

    const EXPIRE_DURATION = 24 * 60 * 60 * 1000;
    const oldSet = new Set(oldVids.filter(Boolean));
    const newSet = new Set(newVids.filter(Boolean));
    const abandoned = [...oldSet].filter(id => !newSet.has(id));
    const active = [...newSet];

    if (active.length > 0) {
      await DraftVideo.updateMany(
        { videoId: { $in: active } },
        { $unset: { expireAt: "" } },
        { session }
      );
    }

    if (abandoned.length > 0) {
      await DraftVideo.updateMany(
        { videoId: { $in: abandoned } },
        { $set: { expireAt: new Date(Date.now() + EXPIRE_DURATION) } },
        { session }
      );
    }

    const insId = (course.instructor?.ref?._id || course.instructor?.ref)?.toString();
    try {
      await notifyUser({
        userId: insId,
        type: NOTIF_TYPE.succeeded,
        message: `Your course "${course.title}" updates have been approved by an administrator and are now live.`
      });
    } catch (err) {
      await session.abortTransaction();
      console.error('Failed to notify instructor during approve:', err?.response?.data || err?.message || err);
      return res.status(500).json({ success: false, message: 'Failed to notify instructor, approval rolled back.' });
    }

    await session.commitTransaction();

    return res.status(200).json({ success: true, message: 'Course approved and published.', result: toCourseDto(course) });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error('Error approving course:', error?.response?.data || error?.message || error);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  } finally {
    if (session) await session.endSession();
  }
};