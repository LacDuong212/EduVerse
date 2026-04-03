import CourseProgress from "#modules/course-progress/course-progress.model.js";
import Student from "#modules/student/student.model.js";
import Streak from "#modules/streak/streak.model.js";
import { withTransaction } from "#utils/transaction.js";

export const getLastLearningProgress = async (userId) => {
  const progress = await CourseProgress.findOne({ userId })
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
}

export const completeLecture = async (userId, courseId, lecId) => {
  return await withTransaction(async (s) => {
    const progress = await CourseProgress.findOne({ user: userId, course: courseId }).session(s);
    if (!progress) throw new AppError("Progress record not found.", 404);

    const lecture = progress.lectures.find(l => l.lectureId.toString() === lecId);
    if (!lecture) throw new AppError("Lecture not found.", 404);

    if (lecture.status !== LECTURE_STATUS_ENUM.completed) {
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

    await Streak.registerActivity(userId);

    await progress.save({ session: s });

    return progress;
  });
};