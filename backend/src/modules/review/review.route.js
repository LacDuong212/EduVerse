import { Router } from "express";
import { protect, restrictTo } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js";
import reviewController from "./review.controller.js";
import * as reviewSchema from "./review.validation.js";

// @route /reviews
const reviewRoute = Router();

reviewRoute.use(protect, restrictTo("student"));

reviewRoute.post("/", validate(reviewSchema.createReviewSchema), reviewController.createReview);
reviewRoute.patch(
  "/:reviewId", validate(reviewSchema.updateReviewSchema), reviewController.updateReview
);
reviewRoute.delete(
  "/:reviewId", validate(reviewSchema.removeReviewSchema), reviewController.removeReview
);

export default reviewRoute;