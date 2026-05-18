import AppError from "#exceptions/app.error.js";
import { countInstructorLiveCourses, createDraft, removeDraft } from "#modules/course/course.service.js";
import { countCompletedOrdersByCourseIds } from "#modules/order/order.service.js";
import { updateProfile } from "#modules/user/user.service.js";
import { withTransaction } from "#utils/transaction.js";
import mongoose from "mongoose";
import Instructor from "./instructor.model.js";

export const handleBecomeInstructor = async (user) => {
  if (!user) throw new AppError("Cannot get your info. Please try again later.", 400);

  return await withTransaction(async (session) => {
    const existingRequest = await Instructor.findOne({ user: user.userId })
      .session(session);

    if (existingRequest) {
      if (existingRequest.isApproved)
        throw new AppError("You are already an instructor!", 409);

      if (user.role === "student")
        throw new AppError("Your request is currently pending approval.", 409);

      if (user.role === "instructor")
        throw new AppError("Your account is blocked.", 403);
    }

    const newInstructor = new Instructor({
      user: user.userId,
      isApproved: false
    });

    await newInstructor.save({ session });
    return newInstructor;
  });
};

export const isApprovedInstructor = async (userId) => {
  if (!userId) return false;
  const instructor = await Instructor.findOne({ user: userId }).lean();
  return instructor?.isApproved === true;
};

export const getInstructorStats = async (userId, isPrivate = false) => {
  if (!userId) throw new AppError("Instructor not found", 400);

  const instructor = await Instructor.findOne({ user: userId }).lean();
  if (!instructor) throw new AppError("Instructor not found", 400);

  const {
    totalStudents = 0,
    totalReviews = 0,
    ratingSum = 0
  } = instructor.stats || {};

  const totalCourses = isPrivate === true
    ? (instructor.myCourses || [])?.length || 0
    : (await countInstructorLiveCourses(userId));

  const averageRating = totalReviews > 0
    ? Number((ratingSum / totalReviews).toFixed(1))
    : 0;

  const totalOrders = isPrivate === true
    ? await countCompletedOrdersByCourseIds(instructor.myCourses || [])
    : undefined;

  return {
    totalCourses,
    totalStudents,
    totalReviews,
    averageRating,
    totalOrders,
  };
};

export const getInstructorProfile = async (userId) => {
  if (!userId) throw new AppError("Instructor ID is required.", 400);

  const instructor = await Instructor.findOne({
    user: userId,
    isApproved: true
  }).populate({
    path: "user",
    select: "name email phonenumber pfpImg website socials isActivated"
  }).lean();
  if (!instructor) throw new AppError("Instructor not found.", 404);

  return instructor;
};

export const updateInstructorProfile = async (userId, changes) => {
  if (!userId) throw new AppError("Instructor ID is required.", 400);

  return await withTransaction(async (s) => {
    const instructor = await Instructor.findOne({ user: userId }).session(s);
    if (!instructor) throw new AppError("Instructor not found.", 404);
    if (!instructor.isApproved)
      throw new AppError("Instructor profile not approved.", 403);

    const { userUpdate, insUpdate } = getUpdateData(changes);

    Object.keys(insUpdate).forEach((key) => {
      instructor.set(key, insUpdate[key]);
    });

    if (userUpdate && Object.keys(userUpdate).length > 0)
      await updateProfile(userId, userUpdate, s);

    await instructor.save({ session: s });

    const result = await instructor.populate({
      path: "user",
      select: "name email phonenumber pfpImg website socials isActivated"
    });

    return result.toObject();
  });
};

const getUpdateData = (data) => {
  const userUpdate = {};

  if (data.name) userUpdate.name = data.name;
  if (data.phonenumber !== undefined) userUpdate.phonenumber = data.phonenumber;
  if (data.avatar !== undefined) userUpdate.pfpImg = data.avatar;
  if (data.website !== undefined) userUpdate.website = data.website;
  if (data.socials?.facebook !== undefined) userUpdate["socials.facebook"] = data.socials.facebook;
  if (data.socials?.instagram !== undefined) userUpdate["socials.instagram"] = data.socials.instagram;
  if (data.socials?.linkedin !== undefined) userUpdate["socials.linkedin"] = data.socials.linkedin;
  if (data.socials?.youtube !== undefined) userUpdate["socials.youtube"] = data.socials.youtube;

  const insUpdate = {};

  if (data.introduction !== undefined) insUpdate.introduction = data.introduction;
  if (data.address !== undefined) insUpdate.address = data.address;
  if (data.occupation) insUpdate.occupation = data.occupation;
  if (data.skills) insUpdate.skills = data.skills;
  if (data.education) insUpdate.education = data.education;

  return { userUpdate, insUpdate };
};

export const getCurrentInstructor = async (userId, session = null) => {
  if (!userId) return null;

  const instructor = await Instructor.findOne({ user: userId })
    .populate("user", "name pfpImg")
    .lean()
    .session(session);
  if (!instructor) return null;

  return {
    insId: instructor?.user?._id || instructor.user,
    name: instructor.user?.name,
    avatar: instructor.user?.pfpImg,
    occupation: instructor.occupation || null,
    courses: instructor.myCourses?.length ?? 0,
    skills: instructor.skills?.length ?? 0,
    education: instructor.education?.length ?? 0,
    isApproved: instructor.isApproved ?? false,
    createdAt: instructor.createdAt || null,
  };
};

export const createDraftCourse = async (userId) => {
  if (!userId) throw new AppError("Instructor ID is required.", 400);

  return await withTransaction(async (session) => {
    const instructor = await Instructor.findOne({ user: userId, isApproved: true })
      .session(session);
    if (!instructor) throw new AppError("Instructor not found or unapproved.", 403);

    const course = await createDraft(instructor, session);

    instructor.myCourses?.push(new mongoose.Types.ObjectId(course.courseId));
    instructor.stats?.totalCourses = instructor.myCourses?.length || 0;

    await instructor.save({ session });

    return course;
  });
};

export const removeDraftCourse = async (userId, courseId) => {
  return await withTransaction(async (session) => {
    const instructor = await Instructor.findOne({ user: userId, isApproved: true }).session(session);
    if (!instructor) throw new AppError("Instructor not found.", 404);

    await removeDraft(userId, courseId, session);

    instructor.myCourses?.pull(new mongoose.Types.ObjectId(courseId));
    instructor.stats?.totalCourses = instructor.myCourses?.length || 0;

    await instructor.save({ session });
  });
};