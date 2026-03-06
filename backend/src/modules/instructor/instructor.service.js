import mongoose from "mongoose";
import AppError from "#exceptions/app.error.js";
import User from "#modules/user/user.model.js";
import Instructor from "./instructor.model.js";

export const handleBecomeInstructor = async (userId) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const existingRequest = await Instructor.findOne({ user: userId }).session(session);

      if (existingRequest) {
        if (existingRequest.isApproved) {
          throw new AppError("You are already an instructor!", 400);
        } else {
          throw new AppError("Your request is currently pending approval.", 400);
        }
      }

      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new AppError("Cannot get your info. Please try again!", 400);
      }

      const newInstructor = new Instructor({
        user: userId,
        isApproved: false
      });

      await newInstructor.save({ session });
    });
  } finally {
    await session.endSession();
  }
};