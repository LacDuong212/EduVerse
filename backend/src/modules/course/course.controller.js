import asyncHandler from "#utils/asyncHandler.js";
import { sendPaginatedResponse, sendSuccessResponse } from "#utils/response.js";
import courseMapper from "./course.mapper.js";
import courseService from "./course.service.js";

// @desc  Get grouped public courses for home page
// @route GET /courses/home
export const getHomeCourses = asyncHandler(async (req, res) => {
  const data = await courseService.getHomeDashboardData();
  return sendSuccessResponse(res, 200, "Courses fetched successfully", data);
});

// @desc  Get public-course-related statistics
// @route GET /courses/stats
export const getCourseStats = asyncHandler(async (req, res) => {
  const stats = await courseService.getGlobalCourseStats();

  return sendSuccessResponse(res, 200, "Course statistics fetched", stats);
});

// @desc  Get all public courses, paginated + filters + sort
// @route GET /courses
export const getAllCourses = asyncHandler(async (req, res) => {
  const { courses, total, page, limit } = await courseService.queryCourses(req.query);

  return sendPaginatedResponse(
    res, 
    200, 
    "Courses fetched successfully", 
    courseMapper.toCourseCardDtoList(courses),
    {
      page,
      limit,
      totalItems: total,
    },
  );
});


export default {
  getHomeCourses,
  getCourseStats,
  getAllCourses,

};