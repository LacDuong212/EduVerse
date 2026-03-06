import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";
import * as courseMapper from "./course.mapper.js";
import * as courseService from "./course.service.js";

// @desc  Get grouped public courses for home page
// @route /home
export const getHomeCourses = asyncHandler(async (req, res) => {
  const data = await courseService.getHomeDashboardData();
  return sendSuccessResponse(res, 200, "Courses fetched successfully", data);
});

// @desc  Get public-course-related statistics
// @route /stats
export const getCourseStats = asyncHandler(async (req, res) => {
  const stats = await courseService.getGlobalCourseStats();

  return sendSuccessResponse(res, 200, "Course statistics fetched", stats);
});

// @desc  Get all public courses, paginated + filters + sort
// @route /
export const getAllCourses = asyncHandler(async (req, res) => {
  const { courses, total } = await courseService.queryCourses(req.query);

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  return sendSuccessResponse(res, 200, "Courses fetched successfully", {
    courses: courseMapper.toCourseCardDtoList(courses),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});