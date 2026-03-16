import CourseProgress from "#modules/course-progress/course-progress.model.js";

export const getLatestLearningProgress = async (userId) => {
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