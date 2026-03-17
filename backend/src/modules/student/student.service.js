import Student from "./student.model.js"

export const createNewStudent = async (userId) => {
  if (!userId) throw new AppError("User ID is required", 400);
  const student = await Student.create({ user: userId });
  return student;
};