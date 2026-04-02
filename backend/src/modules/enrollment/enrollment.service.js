import Fuse from "fuse.js";
import AppError from "#exceptions/app.error.js";
import Course from "#modules/course/course.model.js";
import Instructor from "#modules/instructor/instructor.model.js";
import Student from "#modules/student/student.model.js";
import { getPaginationOptions } from "#utils/pagination.js";
import { withTransaction } from "#utils/transaction.js";
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
  return await withTransaction(async (s) => {
    const existingEnrollments = await Enrollment.find({
      student: stuId,
      course: { $in: courseIds }
    }).session(s);

    const existingCourseIds = existingEnrollments.map(e => e.course.toString());

    const newCourseIds = courseIds.filter(id => !existingCourseIds.includes(id.toString()));

    if (newCourseIds.length === 0)
      return { success: true, enrolledCount: 0, skippedCount: existingCourseIds.length };

    const courses = await Course.find({ _id: { $in: newCourseIds } }).session(s);

    if (courses.length !== newCourseIds.length)
      throw new AppError("Some selected courses no longer exist.", 404);

    const enrollmentData = courses.map(course => ({
      student: stuId,
      course: course._id,
      instructor: course.instructor?.ref,
    }));

    await Enrollment.insertMany(enrollmentData, { session: s });

    const totalNewLectures = courses.reduce((acc, course) => acc + (course.lecturesCount || 0), 0);
    await Student.updateOne(
      { user: stuId },
      {
        $inc: {
          "stats.totalCourses": courses.length,
          "stats.totalLectures": totalNewLectures
        }
      },
      { session: s }
    );

    await Course.updateMany(
      { _id: { $in: courseIds } },
      { $inc: { studentCount: 1 } },
      { session: s }
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
        { session: s }
      )
    );

    await Promise.all(instructorUpdates);

    return {
      enrolledCount: courses.length,
      skippedCount: existingCourseIds.length
    };
  }, session);
};

export const getPaginatedStudentsByInstructorId = async (insId, filters) => {
  if (!insId) throw new AppError("Instructor ID is required.", 400);

  const { page, limit, skip } = getPaginationOptions(filters.page, filters.limit);
  const { search, sort } = filters;

  const match = {
    instructor: insId,
    status: STATUS_ENUM.active,
  };

  if (search) {
    const candidates = await Enrollment.aggregate([
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
      { $limit: 1000 }  // !!
    ]);

    const fuse = new Fuse(candidates, {
      keys: ["name", "email"],
      threshold: 0.4,
      distance: 100,
    });

    const searchResults = fuse.search(search).map((r) => r.item);
    const sorted = sortEnrolledStudents(searchResults, sort);

    const total = sorted.length;
    const paginated = sorted.slice(skip, skip + limit);

    return {
      students: enrollmentMapper.toEnrolledStudentDtoList(paginated),
      total,
      page,
      limit,
    };
  }

  const dbSort = getStudentSortStrategy(sort);

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
    { $sort: dbSort },
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
    limit,
  };
};

const sortEnrolledStudents = (docs, strategy) => {
  const strategies = {
    nameAsc: (a, b) => a.name.localeCompare(b.name),
    nameDesc: (a, b) => b.name.localeCompare(a.name),
    enrolledAsc: (a, b) => new Date(a.enrolledAt) - new Date(b.enrolledAt),
    enrolledDesc: (a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt),
  };

  return docs.sort(strategies[strategy] || strategies.enrolledDesc);
};

const getStudentSortStrategy = (strategy) => ({
  nameAsc: { name: 1 },
  nameDesc: { name: -1 },
  enrolledAsc: { enrolledAt: 1 },
  enrolledDesc: { enrolledAt: -1 },
})[strategy] || { enrolledAt: -1 };

export const getPaginatedStudentCourses = async (stuId, filters) => {
  if (!stuId) throw new AppError("Student ID is required.", 400);

  const { page, limit, skip } = getPaginationOptions(filters.page, filters.limit);
  const { search, sort } = filters;

  const match = {
    user: stuId,
    status: STATUS_ENUM.active,
  };

  const getBasePipeline = (safetyLimit = null) => {
    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: "courses",
          localField: "course",
          foreignField: "_id",
          as: "course"
        }
      },
      { $unwind: "$course" },
      {
        $lookup: {
          from: "courseprogresses",
          let: { userId: "$user", courseId: "$course._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user", "$$userId"] },
                    { $eq: ["$course", "$$courseId"] }
                  ]
                }
              }
            }
          ],
          as: "progress"
        }
      },
      { $unwind: { path: "$progress", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: "$course._id",
          title: "$course.title",
          image: "$course.image",
          thumbnail: "$course.thumbnail",
          enrolledAt: 1,
          totalLectures: { $ifNull: ["$progress.totalLectures", 0] },
          completedLectures: { $ifNull: ["$progress.completedLecturesCount", 0] },
          lastActivityAt: { $ifNull: ["$progress.lastActivityAt", "$enrolledAt"] },
        }
      }
    ];

    if (safetyLimit) pipeline.push({ $limit: safetyLimit });
    return pipeline;
  };

  if (search) {
    const candidates = await Enrollment.aggregate(getBasePipeline(500));

    const fuse = new Fuse(candidates, {
      keys: ["title"],
      threshold: 0.4,
    });

    const searchResults = fuse.search(search).map((r) => r.item);
    const sorted = sortStudentCourses(searchResults, sort);

    return {
      courses: enrollmentMapper.toEnrolledCourseRowDtoList(sorted.slice(skip, skip + limit)),
      total: sorted.length,
      page,
      limit,
    };
  }
  const dbSort = getStudentCourseSort(sort);
  const [result] = await Enrollment.aggregate([
    ...getBasePipeline(),
    { $sort: dbSort },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }]
      }
    }
  ]);

  const total = result.metadata?.[0]?.total || 0;
  const courses = enrollmentMapper.toEnrolledCourseRowDtoList(result.data || []);

  return { courses, total, page, limit };
};

const sortStudentCourses = (docs, strategy) => {
  const strategies = {
    enrolledAsc: (a, b) => new Date(a.enrolledAt) - new Date(b.enrolledAt),
    enrolledDesc: (a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt),
    activityAsc: (a, b) => new Date(a.lastActivityAt) - new Date(b.lastActivityAt),
    activityDesc: (a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt),
    titleAsc: (a, b) => a.title?.localeCompare(b.title),
    titleDesc: (a, b) => b.title?.localeCompare(a.title),
  };
  return docs.sort(strategies[strategy] || strategies.activityDesc);
};

const getStudentCourseSort = (strategy) => ({
  enrolledAsc: { enrolledAt: 1 },
  enrolledDesc: { enrolledAt: -1 },
  activityAsc: { lastActivityAt: 1 },
  activityDesc: { lastActivityAt: -1 },
  titleAsc: { title: 1 },
  titleDesc: { title: -1 },
})[strategy] || { lastActivityAt: -1 };