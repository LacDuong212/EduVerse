import { getPaginatedReviewsByCourseId } from "#modules/review/review.service.js";
import * as recommendService from "#services/recommendation.service.js";
import asyncHandler from "#utils/asyncHandler.js";
import { sendPaginatedResponse, sendSuccessResponse } from "#utils/response.js";
import * as courseMapper from "./course.mapper.js";
import * as courseService from "./course.service.js";

// @desc  Get grouped public courses for home page
// @route GET /home
export const getHomeCourses = asyncHandler(async (req, res) => {
  const data = await courseService.getHomeDashboardData();
  return sendSuccessResponse(res, 200, "Courses fetched successfully", data);
});

// @desc  Get public-course-related statistics
// @route GET /stats
export const getCourseStats = asyncHandler(async (req, res) => {
  const stats = await courseService.getGlobalCourseStats();

  return sendSuccessResponse(res, 200, "Course statistics fetched", stats);
});

// @desc  Get all public courses, paginated + filters + sort
// @route GET ..?page=&limit=&search=&sort=&category=&price=&language=&level=&tag=
export const getAllCourses = asyncHandler(async (req, res) => {
  const { courses, total, page, limit } = await courseService.queryCourses(req.query);

  return sendPaginatedResponse(
    res, 
    200, 
    "Courses fetched successfully", 
    courseMapper.toCourseCardDtoList(courses),
    { page, limit, totalItems: total }
  );
});

// @desc  Get course public details by id
// @route GET /:id
export const getCourseDetailsById = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  const details = await courseService.getCoursePublicDetails(user, id);
  return sendSuccessResponse(res, 200, "Get course details successfully!", details);
});

// @desc  Get course's reviews
// @route GET /:id/reviews
export const getCourseReviewsById = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  const { page, limit } = req.query;

  const {
    myReview,
    reviews,
    total,
    page: pageNum,
    limit: limitCount,
  } = await getPaginatedReviewsByCourseId(user?.userId, id, { page, limit });

  return sendPaginatedResponse(
    res,
    200,
    "Get course's reviews successfully!",
    { myReview, reviews },
    { page: pageNum, limit: limitCount, totalItems: total }
  );
});

// @desc  Get Cloudinary params for uploading course image
// @route Get /:id/image/upload
export const getImageParams = asyncHandler(async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  const result = await courseService.getImageParams(id, user.userId);
  return sendSuccessResponse(res, 200, "Get upload params successfull!", result);
});

// @desc  Get recommended courses for user
// @route GET /recommendations
export const getRecommendedCourses = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const result = await recommendService.getRecommendedCourses(userId);
  return sendSuccessResponse(
    res, 
    200, 
    "Get recommended courses successfully!", 
    {
      courses: courseMapper.toCourseCardDtoList(result?.courses),
      debugSource: result?.debugSource
    }
  );
});

// @desc  Get related courses
// @route GET /:id/related
export const getRelatedCourses = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await recommendService.getRelatedCourses(id);
  return sendSuccessResponse(
    res, 
    200, 
    "Get related courses successfully!", 
    {
      courses: courseMapper.toCourseCardDtoList(result?.courses),
      debugSource: result?.debugSource
    }
  );
});