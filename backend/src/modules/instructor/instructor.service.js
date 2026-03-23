import mongoose from "mongoose";
import AppError from "#exceptions/app.error.js";
import { countCompletedOrdersByCourseIds } from "#modules/order/order.service.js";
import { updateProfile } from "#modules/user/user.service.js";
import { withTransaction } from "#utils/transaction.js";
import Instructor from "./instructor.model.js";

export const handleBecomeInstructor = async (user) => {
  if (!user) {
    throw new AppError("Cannot get your info. Please try again!", 400);
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const existingRequest = await Instructor.findOne({ user: user?.userId }).session(session);

      if (existingRequest) {
        if (existingRequest.isApproved) {
          throw new AppError("You are already an instructor!", 409);
        } else if (user.role === "student") {
          throw new AppError("Your request is currently pending approval.", 409);
        } else if (user.role === "instructor") {
          throw new AppError("Your have been blocked.", 403);
        }
      }

      const newInstructor = new Instructor({
        user: user.userId,
        isApproved: false
      });

      await newInstructor.save({ session });
    });
  } finally {
    await session.endSession();
  }
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
    totalCourses = 0,
    totalStudents = 0,
    totalReviews = 0,
    ratingSum = 0
  } = instructor.stats || {};

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
    select: "name email phonenumber pfpImg website socials"
  }).lean();
  if (!instructor) throw new AppError("Instructor not found.", 404);

  return instructor;
};

export const updateInstructorProfile = async (userId, changes) => {
  if (!userId) throw new AppError("Instructor ID is required.", 400);

  return await withTransaction(async (s) => {
    const { userUpdate, insUpdate } = getUpdateData(changes);

    await updateProfile(userId, userUpdate, s);

    const instructor = await Instructor.findOneAndUpdate(
      { user: userId, isApproved: true },
      { $set: insUpdate },
      { new: true, session: s }
    );

    if (!instructor) throw new AppError("Instructor not found.", 404);



    return await instructor.populate({
      path: "user",
      select: "name email phonenumber pfpImg website socials"
    });
  });
};

const getUpdateData = (data) => {
  const userUpdate = {};

  if (data.name) userUpdate.name = data.name;
  if (data.phone !== undefined) userUpdate.phonenumber = data.phone;
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