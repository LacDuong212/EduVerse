import express from "express";
import userAuth from "../middlewares/userAuth.js";
import { getCourseReviewsForGuests, getCourseReviews, createReview, updateReview, removeReview } from "../controllers/reviewController.js";

const reviewRoute = express.Router();

reviewRoute.get("/:courseId", getCourseReviewsForGuests);
reviewRoute.get("/user/:courseId", userAuth, getCourseReviews);
reviewRoute.post("/", userAuth, createReview);
reviewRoute.patch("/:reviewId", userAuth, updateReview);
reviewRoute.delete("/:reviewId", userAuth, removeReview);

export default reviewRoute;
