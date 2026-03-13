import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse, sendUnsuccessResponse } from "#utils/response.js";
import reviewService from "./review.service.js";

// @desc  Create a review for a course
// @route POST /
export const createReview = asyncHandler(async (req, res) => {
  const user = req.user;
  const reviewReq = req.body;

  const result = await reviewService.createReview(user.userId, reviewReq);
  return sendSuccessResponse(res, 201, "Review created successfully!", result);
});

// @desc  Patch update a review
// @route PATCH /:reviewId
export const updateReview = asyncHandler(async (req, res) => {
  const user = req.user;
  const reviewReq = req.body;
  const { reviewId } = req.params;

  const result = await reviewService.updateReview(user.userId, reviewId, reviewReq);
  return sendSuccessResponse(res, 200, "Review updated successfully!", result);
});

// @desc  Soft-delete a review
// @route DELETE /:reviewId
export const removeReview = asyncHandler(async (req, res) => {
  const user = req.user;
  const { reviewId } = req.params;
  const result = await reviewService.softDeleteReview(user.userId, reviewId);

  if (result) return sendSuccessResponse(res, 204, "Review removed successfully!");
  else return sendUnsuccessResponse(res, 500, "Remove review failed..");
});

export default {
  createReview,
  updateReview,
  removeReview,
};