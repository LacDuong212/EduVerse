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