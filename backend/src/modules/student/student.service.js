import Student from "./student.model.js"

export const createNewStudent = (userId) => {
  const student = new Student({
    user: userId
  });

  return student.save();
};