
export const toEnrolledStudentDto = (student) => ({
  stuId: student._id,
  name: student.name || null,
  email: student.email || null,
  avatar: student.pfpImg || null,
  isActive: student.isActivated ?? false,
  enrolledAt: student.enrolledAt,
  coursesCount: student.coursesCount || 0,
});

export const toEnrolledStudentDtoList = (students) => {
  if (!Array.isArray(students)) return [];
  return students.map(student => toEnrolledStudentDto(student));
};