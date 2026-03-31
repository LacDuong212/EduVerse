import Fuse from "fuse.js";
import AppError from "#exceptions/app.error.js";
import Course from "#modules/course/course.model.js";
import Instructor from "#modules/instructor/instructor.model.js";
import { getPaginationOptions } from "#utils/pagination.js";
import * as enrollmentMapper from "./enrollment.mapper.js";
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

  const instructorIds = courses.map(c => c.instructor?.ref).filter(Boolean);

  const instructorCounts = instructorIds.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  const instructorUpdates = Object.entries(instructorCounts).map(([id, count]) =>
    Instructor.updateOne(
      { _id: id },
      { $inc: { "stats.totalStudents": count } },
      { session }
    )
  );

  await Promise.all(instructorUpdates);

  return { success: true, count: enrollmentData.length };
};

export const getPaginatedStudentsByInstructorId = async (
  insId, filters
) => {
  if (!insId) throw new AppError("Instructor ID is required.", 400);

  const { page, limit, skip } = getPaginationOptions(filters.page, filters.limit);
  const { search, sort } = filters;

  const match = {
    instructor: insId,
    status: STATUS_ENUM.active,
  };

  const searchCondition = search
    ? {
      $or: [
        { "student.name": { $regex: search, $options: "i" } },
        { "student.email": { $regex: search, $options: "i" } }
      ]
    }
    : null;

  const sortMap = {
    nameAsc: { name: 1 },
    nameDesc: { name: -1 },
    enrolledAsc: { enrolledAt: 1 },
    enrolledDesc: { enrolledAt: -1 }
  };

  const [result] = await Enrollment.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "users",
        localField: "student",
        foreignField: "_id",
        as: "student"
      }
    },
    { $unwind: "$student" },
    ...(searchCondition ? [{ $match: searchCondition }] : []),
    {
      $group: {
        _id: "$student._id",
        name: { $first: "$student.name" },
        email: { $first: "$student.email" },
        pfpImg: { $first: "$student.pfpImg" },
        isActivated: { $first: "$student.isActivated" },
        enrolledAt: { $max: "$enrolledAt" },
        coursesCount: { $sum: 1 }
      }
    },
    { $sort: sortMap[sort] || { enrolledAt: -1 } },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }]
      }
    }
  ]);

  const total = result.metadata?.[0]?.total || 0;
  const students = enrollmentMapper.toEnrolledStudentDtoList(result.data || []);

  return {
    students,
    total,
    page,
    limit
  };
};