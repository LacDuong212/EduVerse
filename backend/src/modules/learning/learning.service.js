import mongoose from "mongoose";
import AppError from "#exceptions/app.error.js";
import { STATUS_ENUM as COURSE_STATUS } from "#modules/course/course.model.js";
import { existsEnrollment } from "#modules/enrollment/enrollment.service.js";
import { updateStreak } from "#modules/streak/streak.service.js";
import Student from "#modules/student/student.model.js";
import { withTransaction } from "#utils/transaction.js";
import CourseProgress, { LECTURE_STATUS_ENUM as LECTURE_STATUS } from "./course-progress.model.js";
import { toCourseProgressDto } from "./progress.mapper.js";

export const getLastLearningProgress = async (userId) => {
  const progress = await CourseProgress.findOne({ user: userId })
    .sort({ lastActivityAt: -1 })
    .populate({
      path: "course",
      select: "title curriculum _id",
    });

  if (!progress) return null;

  return {
    courseId: progress.course?._id,
    courseTitle: progress.course?.title,
    curriculum: progress.course?.curriculum,
    lastLectureId: progress.lastLectureId,
    completedCount: progress.completedLecturesCount,
  };
};

export const countInProgressCourses = async (userId) => {
  return await CourseProgress.countDocuments({
    user: userId,
    isCompleted: false,
    completedLecturesCount: { $gt: 0 }
  });
};

export const getCourseProgress = async (stuId, courseId) => {
  if (!stuId) throw new AppError("Student ID is required.", 400);

  const isEnrolled = await existsEnrollment(stuId, courseId);
  if (!isEnrolled)
    throw new AppError("You haven't enrolled this course yet!", 403);

  let progress = await CourseProgress.findOne({ user: stuId, course: courseId })
    .populate("course", "status");

  if(!progress) {
    progress = await CourseProgress.create({ user: stuId, course: courseId });
    await progress.populate("course", "status");
  }

  if (!progress.course)
    throw new AppError("Course not found or no progress saved.", 404);

  if (progress.course?.status !== COURSE_STATUS.live)
    throw new AppError("Course is currently unvailable. Please try again later!", 404);

  return toCourseProgressDto(progress);
};

export const completeLecture = async (userId, courseId, lecId) => {
  return await withTransaction(async (s) => {
    const progress = await CourseProgress.findOne({
      user: userId,
      course: courseId,
    }).session(s);

    if (!progress) throw new AppError("Progress record not found.", 404);

    const lecture = progress.lectures.find(
      (l) => l.lectureId?.toString() === lecId.toString()
    );

    if (!lecture) throw new AppError("Lecture not found.", 404);

    if (lecture.status !== LECTURE_STATUS.completed) {
      lecture.status = LECTURE_STATUS.completed;
      lecture.completedAt = new Date();
      lecture.lastActivityAt = new Date();

      if (lecture.durationSec > 0) {
        lecture.lastPositionSec = lecture.durationSec;
      }

      progress.completedLecturesCount += 1;
      progress.lastLectureId = new mongoose.Types.ObjectId(lecId);
      progress.lastPositionSec = lecture.lastPositionSec || 0;
      progress.lastActivityAt = new Date();

      await Student.updateOne(
        { user: userId },
        { $inc: { "stats.completedLectures": 1 } },
        { session: s }
      );
    }

    if (
      !progress.isCompleted &&
      progress.completedLecturesCount >= progress.totalLectures
    ) {
      progress.isCompleted = true;
      progress.lastActivityAt = new Date();

      await Student.updateOne(
        { user: userId },
        { $inc: { "stats.completedCourses": 1 } },
        { session: s }
      );
    }

    await updateStreak(userId);
    await progress.save({ session: s });

    return toCourseProgressDto(progress);
  });
};

export const syncLectureProgress = async (userId, courseId, lecId, data) => {
  const {
    currentTimeSec = 0,
    durationSec = 0,
    deltaTimeSec = 0,
    isNewSession = false,
  } = data;

  const now = new Date();
  const safeCurrentTime = Math.max(0, Number(currentTimeSec) || 0);
  const safeDuration = Math.max(0, Number(durationSec) || 0);
  const safeDelta = Math.max(0, Number(deltaTimeSec) || 0);

  let progress = await CourseProgress.findOneAndUpdate(
    {
      user: userId,
      course: courseId,
      "lectures.lectureId": lecId,
    },
    {
      $set: {
        "lectures.$.lastPositionSec": safeCurrentTime,
        "lectures.$.durationSec": safeDuration,
        "lectures.$.lastActivityAt": now,
        "lectures.$.status": LECTURE_STATUS.in_progress,
        lastLectureId: new mongoose.Types.ObjectId(lecId),
        lastPositionSec: safeCurrentTime,
        lastActivityAt: now,
      },
      $inc: {
        "lectures.$.totalTimeSpentSec": safeDelta,
        "lectures.$.viewCount": isNewSession ? 1 : 0,
        totalTimeSpentSec: safeDelta,
      },
    },
    { new: true }
  );

  if (!progress) {
    progress = await CourseProgress.findOneAndUpdate(
      {
        user: userId,
        course: courseId,
      },
      {
        $push: {
          lectures: {
            lectureId: new mongoose.Types.ObjectId(lecId),
            status: LECTURE_STATUS.in_progress,
            lastPositionSec: safeCurrentTime,
            durationSec: safeDuration,
            viewCount: isNewSession ? 1 : 0,
            totalTimeSpentSec: safeDelta,
            lastActivityAt: now,
          },
        },
        $set: {
          lastLectureId: new mongoose.Types.ObjectId(lecId),
          lastPositionSec: safeCurrentTime,
          lastActivityAt: now,
          firstStartedAt: now,
        },
        $inc: {
          totalTimeSpentSec: safeDelta,
        },
        $setOnInsert: {
          user: new mongoose.Types.ObjectId(userId),
          course: new mongoose.Types.ObjectId(courseId)
        },
      },
      { new: true, upsert: true }
    );
  }

  if (!progress) {
    throw new AppError("Progress record not found.", 404);
  }

  return toCourseProgressDto(progress);
};