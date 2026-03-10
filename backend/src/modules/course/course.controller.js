import asyncHandler from "#utils/asyncHandler.js";
import { sendPaginatedResponse, sendSuccessResponse } from "#utils/response.js";
import courseMapper from "./course.mapper.js";
import courseService from "./course.service.js";

// @desc  Get grouped public courses for home page
// @route GET ../home
export const getHomeCourses = asyncHandler(async (req, res) => {
  const data = await courseService.getHomeDashboardData();
  return sendSuccessResponse(res, 200, "Courses fetched successfully", data);
});

// @desc  Get public-course-related statistics
// @route GET ../stats
export const getCourseStats = asyncHandler(async (req, res) => {
  const stats = await courseService.getGlobalCourseStats();

  return sendSuccessResponse(res, 200, "Course statistics fetched", stats);
});

// @desc  Get all public courses, paginated + filters + sort
// @route GET ../
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

// @desc  Get course public details by id
// @route GET ../:id/
export const getCourseDetailsById = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  const details = await courseService.getCoursePublicDetails(user, id);
  sendSuccessResponse(res, 200, "Get course details successfully!", details);
});


export default {
  getHomeCourses,
  getCourseStats,
  getAllCourses,
  getCourseDetailsById,

};