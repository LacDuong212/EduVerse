import mongoose from "mongoose";

const isPopulated = (val) => val instanceof mongoose.Model || (val && typeof val === "object" && val._id);
const getStringId = (id) => isPopulated(id) ? id._id?.toString() : id?.toString();

export const toEnrolledStudentDto = (student) => ({
  stuId: getStringId(student),
  name: student?.name || null,
  email: student?.email || null,
  avatar: student?.pfpImg || null,
  isActive: student?.isActivated ?? false,
  enrolledAt: student?.enrolledAt,
  coursesCount: student?.coursesCount || 0,
});

export const toEnrolledStudentDtoList = (students) => {
  if (!Array.isArray(students)) return [];
  return students.map(student => toEnrolledStudentDto(student));
};

export const toEnrolledCourseRowDto = (course) => {
  if (!course) return null;

  const percentage = course.totalLectures > 0
    ? Math.round((course.completedLectures / course.totalLectures) * 100)
    : 0;

  return {
    courseId: getStringId(course),
    title: course.title,
    image: course.image,
    thumbnail: course.thumbnail,
    percentage,
    totalLectures: course.totalLectures,
    completedLectures: course.completedLectures,
    lastActivityAt: course.lastActivityAt,
    enrolledAt: course.enrolledAt,
  };
};

export const toEnrolledCourseRowDtoList = (courses) => {
  if (!Array.isArray(courses)) return [];
  return courses.map(course => toEnrolledCourseRowDto(course));
};