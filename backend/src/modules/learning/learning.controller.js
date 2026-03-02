import CourseProgress from "#modules/course-progress/course-progress.model.js";

export async function getLatestLearningProgress(userId) {
  const progress = await CourseProgress.findOne({ userId })
    .sort({ lastActivityAt: -1 })
    .populate({
      path: "courseId",
      select: "title curriculum _id",
    });

  if (!progress) return null;

  return {
    courseId: progress.courseId._id,
    courseTitle: progress.courseId.title,
    curriculum: progress.courseId.curriculum,
    lastLectureId: progress.lastLectureId,
    completedCount: progress.completedLecturesCount,
  };
}