import { z } from "zod";
import mongoose from "mongoose";

export const courseIdRequest = z.object({
  body: z.object({
    courseId: z.string("Course ID is required")
      .trim()
      .min(1, "Course ID cannot be empty")
      .pipe(
        z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
          message: "Invalid course ID format",
        })
      )
  })
});

export const courseIdQuery = z.object({
  query: z.object({
    courseId: z.string("Course ID is required")
      .trim()
      .min(1, "Course ID cannot be empty")
      .pipe(
        z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
          message: "Invalid course ID format",
        })
      )
  })
});