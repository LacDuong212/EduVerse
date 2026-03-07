import mongoose from "mongoose";
import AppError from "#exceptions/app.error.js";
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