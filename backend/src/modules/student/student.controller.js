import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";
import * as studentService from "./student.service.js";

// @desc  Patch update a student's profile
// @route PATCH /profile
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const changes = req.validated?.body;
  const updated = await studentService.updateStudentProfile(userId, changes);
  return sendSuccessResponse(res, 200, "Profile updated successfully!", updated);
});