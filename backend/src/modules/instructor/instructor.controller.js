import AppError from "#exceptions/app.error.js";
import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";
import * as instructorService from "./instructor.service.js";

// @desc  Get instructor details
// @route GET /api/instructor
export const getInstructorDetails = asyncHandler(async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return next(new AppError("User not authenticated", 401));
  }

  const instructor = await instructorService.getInstructorDetails(user.id);
  sendSuccessResponse(res, 200, "Instructor details retrieved successfully", instructor);
});