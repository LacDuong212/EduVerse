import asyncHandler from "#utils/asyncHandler.js";
import { sendPaginatedResponse, sendSuccessResponse } from "#utils/response.js";
import { getPaginatedStudentCourses } from "#modules/enrollment/enrollment.service.js";
import * as studentMapper from "./student.mapper.js";
import * as studentService from "./student.service.js";

// @desc  Patch update a student's profile
// @route PATCH /profile
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const changes = req.validated?.body || {};
  const result = await studentService.updateStudentProfile(userId, changes);
  return sendSuccessResponse(
    res,
    200,
    "Profile updated successfully!",
    studentMapper.toStudentProfileDto(result)
  );
});

// @desc  Get student's profile
// @route GET /profile
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const result = await studentService.getStudentProfile(userId);
  sendSuccessResponse(
    res,
    200,
    "Get student's profile successfully!",
    studentMapper.toStudentProfileDto(result)
  );
});

// @desc  Update student's interests
// @route PUT /interests
export const updateInterests = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { interests } = req.validated?.body || {};
  const result = await userService.updateInterests(userId, interests);
  return sendSuccessResponse(res, 200, "Interests updated successfully!", result);
});

// @desc  Get student's enrolled courses
// @route GET /courses?page=&limit=&search=&sort=
export const getEnrolledCourses = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
    const query = req.validated?.query || {};
    const {
      courses, total, page, limit
    } = await getPaginatedStudentCourses(userId, query);
  
    return sendPaginatedResponse(
      res,
      200,
      "Get courses successfully!",
      courses,
      { page, limit, totalItems: total }
    );
});