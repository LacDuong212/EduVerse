import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";
import instructorService from "./instructor.service.js";

// @desc  Handle student's request to become an instructor
// @route POST /instructors
export const becomeInstructor = asyncHandler(async (req, res) => {
  const user = req.user;
  await instructorService.handleBecomeInstructor(user);
  sendSuccessResponse(res, 200, "Apply for instructor successfully. Please wait for approval!");
});

// @desc  Get instructor public statistics
// @route GET /instructors/:insId/stats
export const getInstructorPublicStats = asyncHandler(async (req, res) => {
  const { insId } = req.params;
  const stats = await instructorService.getInstructorStats(insId, false);
  sendSuccessResponse(res, 200, "Get instructor stats successfully.", { ...stats })  
});

// @desc  Get instructor private statistics
// @route GET /instructor/stats
export const getInstructorStats = asyncHandler(async (req, res) => {
  const user = req.user;
  const stats = await instructorService.getInstructorStats(user.userId, true);
  sendSuccessResponse(res, 200, "Get instructor stats successfully.", { ...stats })  
});


export default {
  becomeInstructor,
  getInstructorPublicStats,
  getInstructorStats,
  
};