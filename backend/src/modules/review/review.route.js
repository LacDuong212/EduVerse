import { Router } from "express";
import { protect, restrictTo } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js";
import * as reviewController from "./review.controller.js";
import * as reviewSchema from "./review.validation.js";

// @route /reviews
const reviewRoute = Router();

reviewRoute.post(
  "/",
  protect,
  restrictTo("student"),
  validate(reviewSchema.createReviewRequest),
  reviewController.createReview
);
reviewRoute.patch(
  "/:reviewId",
  protect,
  restrictTo("student"),
  validate(reviewSchema.updateReviewRequest),
  reviewController.updateReview
);
reviewRoute.delete(
  "/:reviewId",
  protect,
  restrictTo("student"),
  validate(reviewSchema.removeReviewRequest),
  reviewController.removeReview
);

export default reviewRoute;