import AppError from "#exceptions/app.error.js";
import Course from "#modules/course/course.model.js";
import Enrollment, { STATUS_ENUM } from "./enrollment.model.js";

export const existsEnrollment = async (stuId, courseId) => {
  if (!stuId || !courseId) return false;

  const enrolled = await Enrollment.findOne({
    student: stuId,
    course: courseId,
    status: STATUS_ENUM.active,
  }).lean();
  if (!enrolled) return false;

  return true;
};

export const enrollsCourses = async (stuId, courseIds, session = null) => {
  const courses = await Course.find({ _id: { $in: courseIds } }).session(session);

  if (courses.length !== courseIds.length) {
    throw new AppError("One or more courses not found for enrollment.", 404);
  }

  const existing = await Enrollment.findOne({
    student: stuId,
    course: { $in: courseIds }
  }).session(session);

  if (existing)
    throw new AppError("Student is already enrolled in one of these courses", 400);

  const enrollmentData = courses.map(course => ({
    student: stuId,
    course: course._id,
    instructor: course.instructor?.ref,
  }));

  await Enrollment.insertMany(enrollmentData, { session });

  await Course.updateMany(
    { _id: { $in: courseIds } },
    { $inc: { studentCount: 1 } },
    { session }
  );

  return { success: true, count: enrollmentData.length };
};

export default {
  existsEnrollment,
  enrollsCourses,
};