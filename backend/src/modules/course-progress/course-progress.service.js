import CourseProgress from "./course-progress.model.js";

export const countInProgressCourses = async (userId) => {
  return await CourseProgress.countDocuments({
    user: userId,
    isCompleted: false,
    completedLecturesCount: { $gt: 0 }
  });
};