import Enrollment from "./enrollment.model.js";

export const existsEnrollment = async (stuId, courseId) => {
  if (!stuId || !courseId) return false;

  const enrolled = await Enrollment.findOne({ student: stuId, course: courseId }).lean();
  if (!enrolled) return false;
  
  return true;
};