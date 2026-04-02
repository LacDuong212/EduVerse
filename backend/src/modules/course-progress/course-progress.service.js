import AppError from "#exceptions/app.error.js";
import Student from "#modules/student/student.model.js";
import { withTransaction } from "#utils/transaction.js";
import CourseProgress from "./course-progress.model.js";

export const markLectureAsCompleted = async (userId, courseId, lecId) => {
  return await withTransaction(async (s) => {
    const progress = await CourseProgress.findOne({ user: userId, course: courseId }).session(s);
    if (!progress) throw new AppError("Progress record not found.", 404);

    const lecture = progress.lectures.find(l => l.lectureId.toString() === lecId);
    if (lecture && lecture.status !== LECTURE_STATUS_ENUM.completed) {
      lecture.status = LECTURE_STATUS_ENUM.completed;
      lecture.completedAt = new Date();
      progress.completedLecturesCount += 1;

      await Student.updateOne(
        { user: userId },
        { $inc: { "stats.completedLectures": 1 } },
        { session: s }
      );
    }

    if (!progress.isCompleted && progress.completedLecturesCount >= progress.totalLectures) {
      progress.isCompleted = true;
      progress.lastActivityAt = new Date();

      await Student.updateOne(
        { user: userId },
        { $inc: { "stats.completedCourses": 1 } },
        { session: s }
      );
    }

    await progress.save({ session: s });
    return progress;
  });
};

export const countInProgressCourses = async (userId) => {
  return await CourseProgress.countDocuments({
    user: userId,
    isCompleted: false,
    completedLecturesCount: { $gt: 0 }
  });
};