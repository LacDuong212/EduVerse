import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";
import * as revenueService from "#modules/revenue/revenue.service.js";
import * as instructorMapper from "./instructor.mapper.js";
import * as instructorService from "./instructor.service.js";

// @desc  Handle student's request to become an instructor
// @route POST instructors/
export const becomeInstructor = asyncHandler(async (req, res) => {
  const user = req.user;
  await instructorService.handleBecomeInstructor(user);
  sendSuccessResponse(res, 200, "Apply for instructor successfully. Please wait for approval!");
});

// @desc  Get instructor public statistics
// @route GET instructors/:insId/stats
export const getInstructorPublicStats = asyncHandler(async (req, res) => {
  const { insId } = req.validated?.params;
  const stats = await instructorService.getInstructorStats(insId, false);
  sendSuccessResponse(res, 200, "Get instructor stats successfully.", { ...stats })
});

// @desc  Get instructor private statistics
// @route GET instructor/stats
export const getInstructorStats = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const stats = await instructorService.getInstructorStats(userId, true);
  sendSuccessResponse(res, 200, "Get instructor stats successfully.", { ...stats })
});

// @desc  Get courses monthly earning (12 months)
// @route GET instructor/charts/earning
export const getCoursesMonthlyEarning = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const result = await revenueService.getCoursesMonthlyEarningByInstructorId(userId);
  sendSuccessResponse(res, 200, "Get courses monthly earning successfully!", result);
});

// @desc  Get instructor top earning courses this month
// @route GET instructor/charts/top-courses
export const getTopEarningCourses = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { limit } = req.validated?.query;
  const result = await revenueService.getTopEarningCoursesThisMonth(userId, limit);
  sendSuccessResponse(res, 200, "Get top earning courses successfully!", result);
});

// @desc  Get instructor's public profile
// @route GET instructors/:insId
export const getPublicProfile = asyncHandler(async (req, res) => {
  const { insId } = req.validated?.params;
  const result = await instructorService.getInstructorProfile(insId);
  sendSuccessResponse(
    res,
    200,
    "Get instructor's profile successfully!",
    instructorMapper.toInstructorDetails(result, true)
  );
});

// @desc  Get instructor's private profile
// @route GET instructor/profile
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const result = await instructorService.getInstructorProfile(userId);
  sendSuccessResponse(
    res,
    200,
    "Get instructor's profile successfully!",
    instructorMapper.toInstructorDetails(result, true)
  );
});

// @desc  Patch update an instructor's profile
// @route PATCH /profile
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const changes = req.validated?.body;
  const updated = await instructorService.updateInstructorProfile(userId, changes);
  return sendSuccessResponse(
    res,
    200,
    "Profile updated successfully!",
    instructorMapper.toInstructorDetails(updated));
});