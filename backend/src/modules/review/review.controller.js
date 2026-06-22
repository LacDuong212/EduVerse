import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse, sendUnsuccessResponse } from "#utils/response.js";
import * as reviewService from "./review.service.js";

// @desc  Create a review for a course
// @route POST /
export const createReview = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const reviewReq = req.validated?.body || {};

  const result = await reviewService.createReview(userId, reviewReq);
  return sendSuccessResponse(res, 201, "Review created successfully!", result);
});

// @desc  Patch update a review
// @route PATCH /:reviewId
export const updateReview = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const reviewReq = req.validated?.body || {};
  const { reviewId } = req.validated?.params || {};

  const result = await reviewService.updateReview(userId, reviewId, reviewReq);
  return sendSuccessResponse(res, 200, "Review updated successfully!", result);
});

// @desc  Check if current user has reviewed a course
// @route GET /check/:courseId
export const checkMyReview = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { courseId } = req.params;
  const result = await reviewService.checkMyReview(userId, courseId);
  return sendSuccessResponse(res, 200, "Review check successful.", result);
});

// @desc  Soft-delete a review
// @route DELETE /:reviewId
export const removeReview = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { reviewId } = req.validated?.params || {};
  const result = await reviewService.softDeleteReview(userId, reviewId);

  if (result) return sendSuccessResponse(res, 204, "Review removed successfully!");
  else return sendUnsuccessResponse(res, 500, "Remove review failed..");
});