import Fuse from "fuse.js";
import mongoose from "mongoose";
import Course, { STATUS_ENUM as COURSE_STATUS, UPDATE_STATUS_ENUM as UPDATE_STATUS } from "../models/courseModel.js";
import Curriculum from "../models/curriculumModel.js";
import DraftVideo from "../models/draftVideoModel.js";
import Instructor from "../models/instructorModel.js";
import Enrollment, { STATUS_ENUM as ENROLL_STATUS } from "../models/enrollmentsModel.js";
import { TYPE_ENUM as NOTIF_TYPE } from "../models/notificationModel.js";
import { SUPPORT_EMAIL } from "../utils/constants.js";
import { toCourseDto, toCourseDtoList } from "../utils/mapper.js";
import { notifyUser, notifyUsers, createNotifications } from "../utils/notification.js";

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

    const insId = (course.instructor?.ref?._id || course.instructor?.ref)?.toString();
    const studentIds = [];
    const notificationPromises = [];

    if (newValue === COURSE_STATUS.blocked) {
      const enrolledStudents = await Enrollment.find({
        course: course._id,
        status: { $in: [ENROLL_STATUS.active, ENROLL_STATUS.completed] }
      }).session(session).lean();

      const enrolledIds = [...new Set((enrolledStudents || []).map(e => e.student?.toString()).filter(Boolean))];

      if (enrolledIds.length > 0) {
        studentIds.push(...enrolledIds);
        notificationPromises.push(createNotifications(
          enrolledIds,
          NOTIF_TYPE.info,
          `The course "${course.title}" has been blocked by an administrator.${message ? `\nReason: “${message}”.` : ''}`,
          session
        ));
      }

      if (insId) {
        notificationPromises.push(createNotifications(
          [insId],
          NOTIF_TYPE.blocked,
          `Your course "${course.title}" has been blocked by an administrator.${message ? `\nReason: “${message}”.` : ''}\nPlease update it as soon as possible to restore access.`,
          session
        ));
      }
    } else if (newValue === COURSE_STATUS.rejected) {
      if (insId) {
        notificationPromises.push(createNotifications(
          [insId],
          NOTIF_TYPE.rejected,
          `Your course "${course.title}" changes were not approved.${message ? `\nReason: “${message}”.` : ''}`,
          session
        ));
      }
    } else if (newValue === COURSE_STATUS.pending) {
      if (insId) {
        notificationPromises.push(createNotifications(
          [insId],
          NOTIF_TYPE.info,
          `Your course "${course.title}" is under review.`,
          session
        ));
      }
    }

    if (notificationPromises.length > 0) {
      await Promise.all(notificationPromises);
    }

    await session.commitTransaction();
    session.endSession();
    session = null;

    try {
      const notifyIds = [...new Set([...(studentIds || []), insId].filter(Boolean))];
      if (notifyIds.length > 0) {
        await notifyUsers({ userIds: notifyIds });
      }
    } catch (notifyErr) {
      console.error('[Update Course Status]: Real-time notification delivery failed (non-critical):', notifyErr.message);
    }

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

    course.isDeleted = true;
    await course.save({ session });

    if (instructor) {
      instructor.myCourses?.pull(course._id);
      instructor.stats.totalCourses = instructor.myCourses?.length || 0;
      await instructor.save({ session });

      await createNotifications([
        insId?.toString()
      ], NOTIF_TYPE.blocked,
      `Your course "${course.title}" has been deleted by an administrator.${message ? `\nReason: “${message}”.` : ''}\nIf you have any questions please email <${SUPPORT_EMAIL}> for support!`,
      session);
    }

    await session.commitTransaction();
    session.endSession();
    session = null;

    try {
      const notifyIds = insId ? [insId.toString()] : [];
      if (notifyIds.length > 0) {
        await notifyUsers({ userIds: notifyIds });
      }
    } catch (notifyErr) {
      console.error('[Soft Delete Course]: Real-time notification delivery failed (non-critical):', notifyErr.message);
    }

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

    await createNotifications([
      insId?.toString()
    ], NOTIF_TYPE.info,
    `Your course "${course.title}" has been restored by an administrator.${message ? `\nReason: “${message}”.` : ''}\nIf you have any questions please email <${SUPPORT_EMAIL}> for support!`,
    session);

    await session.commitTransaction();
    session.endSession();
    session = null;

    try {
      const notifyIds = insId ? [insId.toString()] : [];
      if (notifyIds.length > 0) {
        await notifyUsers({ userIds: notifyIds });
      }
    } catch (notifyErr) {
      console.error('[Restore Course]: Real-time notification delivery failed (non-critical):', notifyErr.message);
    }

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
    const studentEnrollments = await Enrollment.find({
      course: course._id,
      status: { $in: [ENROLL_STATUS.active, ENROLL_STATUS.completed] }
    }).session(session).lean();

    const studentIds = [...new Set((studentEnrollments || []).map(e => e.student?.toString()).filter(Boolean))];
    const notificationPromises = [];

    if (studentIds.length > 0) {
      notificationPromises.push(createNotifications(
        studentIds,
        NOTIF_TYPE.info,
        `The course "${course.title}" has been unblocked.`,
        session
      ));
    }

    if (insId) {
      notificationPromises.push(createNotifications(
        [insId],
        NOTIF_TYPE.info,
        `Your course "${course.title}" has been unblocked and reverted back to [${targetStatus.toUpperCase()}] status.${message ? `\nReason: “${message}”.` : ''}\nIf you have any questions please email <${SUPPORT_EMAIL}> for support!`,
        session
      ));
    }

    if (notificationPromises.length > 0) {
      await Promise.all(notificationPromises);
    }

    await session.commitTransaction();
    session.endSession();
    session = null;

    try {
      const notifyIds = [...new Set([...(studentIds || []), insId].filter(Boolean))];
      if (notifyIds.length > 0) {
        await notifyUsers({ userIds: notifyIds });
      }
    } catch (notifyErr) {
      console.error('[Unblock Course]: Real-time notification delivery failed (non-critical):', notifyErr.message);
    }

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

const stripMongoose = (val) => {
  if (!val) return null;

  const raw = typeof val.toObject === 'function' ? val.toObject() : val;

  if (raw === null || (typeof raw === 'object' && Object.keys(raw).length === 0)) {
    return null;
  }

  return raw;
};

const getMergedCourse = (courseDoc) => {
  const pendingCourse = courseDoc.pendingUpdate?.data || {};
  return {
    ...courseDoc.toObject(),
    ...pendingCourse,
    hasPendingChanges: Object.keys(pendingCourse).length > 0
  }
};

const getMergedCurriculum = (curriculumDoc) => {
  const pendingCurr = curriculumDoc?.pendingUpdate?.data || {};

  const liveSections = curriculumDoc?.sections || [];
  const pendingSections = pendingCurr?.sections || [];

  const maxLength = Math.max(liveSections.length, pendingSections.length);
  const mergedSections = [];

  for (let i = 0; i < maxLength; i++) {
    const liveSec = liveSections[i] ? (liveSections[i].toObject?.() || liveSections[i]) : null;
    const pendingSec = pendingSections[i] || null;

    if (!pendingSec && liveSec) {
      mergedSections.push(liveSec);
      continue;
    }

    const mergedLectures = [];
    const maxLecLength = Math.max(liveSec?.lectures?.length || 0, pendingSec?.lectures?.length || 0);

    for (let j = 0; j < maxLecLength; j++) {
      const liveLec = liveSec?.lectures?.[j] ? (liveSec.lectures[j].toObject?.() || liveSec.lectures[j]) : null;
      const pendingLec = pendingSec?.lectures?.[j] || null;

      if (pendingLec) {
        const isNewVideo = liveLec && pendingLec.videoId !== liveLec.videoId;

        let finalAiData = null;
        const liveAi = stripMongoose(liveLec?.aiData);
        const pendingAi = stripMongoose(pendingLec?.aiData);

        if (pendingAi !== null && Object.keys(pendingAi).length > 0) {
          finalAiData = {
            summary: pendingAi.summary !== undefined ? pendingAi.summary : liveAi?.summary || "",
            status: pendingAi.status !== undefined ? pendingAi.status : liveAi?.status || AI_DATA_STATUS.none,
            lessonNotes: pendingAi.lessonNotes ? {
              keyConcepts: pendingAi.lessonNotes.keyConcepts || liveAi?.lessonNotes?.keyConcepts || [],
              mainPoints: pendingAi.lessonNotes.mainPoints || liveAi?.lessonNotes?.mainPoints || [],
              practicalTips: pendingAi.lessonNotes.practicalTips || liveAi?.lessonNotes?.practicalTips || []
            } : liveAi?.lessonNotes || undefined,
            quizzes: (pendingAi.quizzes || liveAi?.quizzes)?.map(quiz => ({
              _id: quiz._id || (quiz.questId ? new mongoose.Types.ObjectId(quiz.questId) : new mongoose.Types.ObjectId()),
              question: quiz.question || "",
              options: quiz.options || [],
              correctAnswer: quiz.correctAnswer || null,
              explanation: quiz.explanation || "",
              topic: quiz.topic || "General Knowledge"
            }))
          };
        } else {
          finalAiData = null;
        }

        mergedLectures.push({
          ...liveLec,
          ...pendingLec,
          oldVideoId: isNewVideo ? liveLec.videoId : undefined,
          videoId: pendingLec.videoId || liveLec?.videoId,
          aiData: finalAiData
        });

      } else if (liveLec) {
        mergedLectures.push(liveLec);
      }
    }

    mergedSections.push({
      ...(liveSec || {}),
      ...(pendingSec || {}),
      lectures: mergedLectures
    });
  }

  return {
    sections: mergedSections,
    hasPendingChanges: !!pendingSections.length
  };
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
      const { sections } = getMergedCurriculum(curriculum);

      curriculum.sections = sections;
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
      const mergedCourseData = getMergedCourse(course);

      course.previousStatus = course.status;

      delete mergedCourseData.hasPendingChanges;
      delete mergedCourseData.pendingUpdate;
      delete mergedCourseData._id;

      course.set(mergedCourseData);
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

    const studentEnrollments = await Enrollment.find({
      course: course._id,
      status: { $in: [ENROLL_STATUS.active, ENROLL_STATUS.completed] }
    }).session(session).lean();

    const studentIds = [...new Set((studentEnrollments || []).map(e => e.student?.toString()).filter(Boolean))];
    const insId = (course.instructor?.ref?._id || course.instructor?.ref)?.toString();

    try {
      if (studentIds.length > 0) {
        await createNotifications(
          studentIds,
          NOTIF_TYPE.info,
          `The course "${course.title}" has been updated.`,
          session
        );
      }

      if (insId) {
        await createNotifications(
          [insId],
          NOTIF_TYPE.approved,
          `Your course "${course.title}" updates have been approved by an administrator and are now live.`,
          session
        );
      }
    } catch (err) {
      await session.abortTransaction();
      console.error('[Approve Course]: Failed to create notifications, rolling back:', err?.message || err);
      return res.status(500).json({ success: false, message: 'Approval failed, please try again later.' });
    }

    await session.commitTransaction();
    session.endSession();
    session = null;

    try {
      const notifyIds = [...new Set([...(studentIds || []), insId].filter(Boolean))];
      if (notifyIds.length > 0) {
        await notifyUsers({ userIds: notifyIds });
      }
    } catch (notifyErr) {
      console.error('[Approve Course]: Real-time notification delivery failed (non-critical):', notifyErr.message);
    }

    return res.status(200).json({ success: true, message: 'Course approved and published.', result: toCourseDto(course) });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error('Error approving course:', error?.response?.data || error?.message || error);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' });
  } finally {
    if (session) await session.endSession();
  }
};