import AppError from "#exceptions/app.error.js";
import { existsEnrollment } from "#modules/enrollment/enrollment.service.js";
import * as learningService from "#modules/learning/learning.service.js";
import { updateProfile } from "#modules/user/user.service.js";
import { withTransaction } from "#utils/transaction.js";
import Student from "./student.model.js"
import Course, { STATUS_ENUM as COURSE_STATUS } from "#modules/course/course.model.js";
import { toStudentLearningCourseDto } from "#modules/course/course.mapper.js";

export const createNewStudent = async (userId, session = null) => {
  if (!userId) throw new AppError("User ID is required", 400);

  const student = await Student.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId } },
    { upsert: true, new: true, runValidators: true, session }
  );

  return student;
};

export const updateStudentProfile = async (userId, changes, session = null) => {
  if (!userId) throw new AppError("Student ID is required.", 400);

  return await withTransaction(async (s) => {
    const student = await Student.findOne({ user: userId }).session(s);
    if (!student) throw new AppError("Student not found.", 404);

    const { userUpdate } = getUpdateData(changes);

    if (userUpdate && Object.keys(userUpdate).length > 0)
      await updateProfile(userId, userUpdate, s);

    await student.save({ session: s });

    const result = await student.populate({
      path: "user",
      select: "name email phonenumber pfpImg bio website socials isActivated"
    });

    return result.toObject();
  }, session);
};

const getUpdateData = (data) => {
  const userUpdate = {};

  if (data.name) userUpdate.name = data.name;
  if (data.phonenumber !== undefined) userUpdate.phonenumber = data.phonenumber;
  if (data.avatar !== undefined) userUpdate.pfpImg = data.avatar;
  if (data.bio !== undefined) userUpdate.bio = data.bio;
  if (data.website !== undefined) userUpdate.website = data.website;
  if (data.socials?.facebook !== undefined) userUpdate["socials.facebook"] = data.socials.facebook;
  if (data.socials?.instagram !== undefined) userUpdate["socials.instagram"] = data.socials.instagram;
  if (data.socials?.linkedin !== undefined) userUpdate["socials.linkedin"] = data.socials.linkedin;
  if (data.socials?.youtube !== undefined) userUpdate["socials.youtube"] = data.socials.youtube;

  return { userUpdate };
};

export const getStudentProfile = async (userId) => {
  if (!userId) throw new AppError("Student ID is required.", 400);

  const student = await Student.findOne({ user: userId })
    .populate({
      path: "user",
      select: "name email phonenumber pfpImg bio website socials isActivated"
    }).lean();
  if (!student) throw new AppError("Student not found.", 404);

  return student;
};

export const updateStudentInterests = async (userId, interests) => {
  if (!interests && !Array.isArray(interests))
    throw new AppError("Interests must be an array.", 400);

  const updated = await Student.findOneAndUpdate(
    { user: userId },
    { interests: interests },
    { new: true, lean: true }
  );

  return updated.interests;
};

export const getStudentCoursesStats = async (userId) => {
  if (!userId) throw new AppError("Student ID is required", 400);

  const student = await Student.findOne({ user: userId })
    .select("stats.totalCourses stats.completedCourses")
    .lean();
  if (!student) throw new AppError("Student not found", 404);

  const total = student?.stats?.totalCourses || 0;
  const completed = student?.stats?.completedCourses || 0;
  const inProgress = await learningService.countInProgressCourses(userId);
  const totalNotStarted = Math.max(0, total - completed - inProgress);

  return {
    totalCourses: total,
    totalCompleted: completed,
    totalInProgress: inProgress,
    totalNotStarted,
  };
};

export const getStudentStats = async (userId) => {
  if (!userId) throw new AppError("Student ID is required", 400);

  const student = await Student.findOne({ user: userId })
    .select("stats")
    .lean();
  if (!student) throw new AppError("Student not found", 404);

  return {
    totalCourses: student.stats?.totalCourses || 0,
    completedCourses: student.stats?.completedCourses || 0,
    totalLectures: student.stats?.totalLectures || 0,
    completedLectures: student.stats?.completedLectures || 0,
  };
};

export const handleUpdateLectureProgress = async (stuId, courseId, lecId, data) => {
  if (!stuId) throw new AppError("Student ID is required", 400);
  if (!courseId) throw new AppError("Course ID is required", 400);
  if (!lecId) throw new AppError("Lecture ID is required", 400);

  const isEnrolled = await existsEnrollment(stuId, courseId);
  if (!isEnrolled) {
    throw new AppError("You haven't enrolled this course yet!", 403);
  }

  const {
    currentTimeSec = 0,
    durationSec = 0,
    deltaTimeSec = 0,
    isCompleted = false,
    isNewSession = false,
  } = data;

  let progress = await learningService.syncLectureProgress(stuId, courseId, lecId, {
    currentTimeSec,
    durationSec,
    deltaTimeSec,
    isNewSession,
  });

  if (isCompleted) {
    progress = await learningService.completeLecture(stuId, courseId, lecId);
  }

  return progress;
};

export const getStudentInterests = async (userId) => {
  if (!userId) return [];
  const student = await Student.findOne({ user: userId }).select("interests").lean();
  return student.interests || [];
};

export const getStudentLearningCourseDetail = async (userId, courseId) => {
  if (!userId) throw new AppError("Student ID is required.", 400);
  if (!courseId) throw new AppError("Course ID is required.", 400);

  const isEnrolled = await existsEnrollment(userId, courseId);
  if (!isEnrolled) {
    throw new AppError("You haven't enrolled this course yet!", 403);
  }

  const course = await Course.findOne({
    _id: courseId,
    isDeleted: false,
  })
    .populate({
      path: "category",
      select: "name slug",
    })
    .populate({
      path: "curriculum",
      select: {
        "_id": 0,
        "__v": 0,
      },
    })
    .lean();

  if (!course) throw new AppError("Course not found.", 404);

  if (course.status !== COURSE_STATUS.live) {
    throw new AppError("Course is currently unavailable.", 404);
  }

  return toStudentLearningCourseDto(course);
};