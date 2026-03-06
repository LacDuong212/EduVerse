import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";
import * as instructorService from "./instructor.service.js";

// @desc  Handle student's request to become an instructor
// @route POST /api/instructors
export const becomeInstructor = asyncHandler(async (req, res, next) => {
  const user = req.user;
  await instructorService.handleBecomeInstructor(user.userId);
  sendSuccessResponse(res, 200, "Apply for instructor successfully. Please wait for approval!");
});