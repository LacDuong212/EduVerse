import mongoose from "mongoose";
import { z } from "zod";

const reviewIdSchema = z.string({ error: "Review ID is required" })
  .trim()
  .min(1, "Review ID cannot be empty")
  .pipe(
    z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid review ID format",
    })
  );

const courseIdSchema = z.string({ error: "Course ID is required" })
  .trim()
  .min(1, "Course ID cannot be empty")
  .pipe(
    z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid course ID format",
    })
  );

const ratingSchema = z.number({ error: "Rating is required" })
  .min(1, "Rating must be at least 1")
  .max(5, "Rating cannot be greater than 5");

const descSchema = z.string({ error: "Description must be a string" })
  .trim()
  .max(500, "Description cannot exceed 500 characters")
  .optional()
  .nullable()
  .or(z.literal(""));

export const createReviewSchema = z.object({
  body: z.object({
    courseId: courseIdSchema,
    rating: ratingSchema,
    description: descSchema,
  }),
});

export const updateReviewSchema = z.object({
  params: z.object({
    reviewId: reviewIdSchema,
  }),
  body: z.object({
    rating: ratingSchema.optional(),  // now optional cus of PATCH
    description: descSchema,
  }).refine(data => Object.keys(data).length > 0, {
    message: "Please provide at least one field to update",
  }),
});

export const removeReviewSchema = z.object({
  params: z.object({
    reviewId: reviewIdSchema,
  }),
});