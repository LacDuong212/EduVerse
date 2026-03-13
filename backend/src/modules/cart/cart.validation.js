import mongoose from "mongoose";
import { z } from "zod";

export const addToCartSchema = z.object({
  body: z.object({
    courseId: z
      .string({
        error: "Course ID is required",
      }).trim()
      .min(1, "Course ID cannot be empty")
      .pipe(
        z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
          message: "Invalid course ID format",
        })
      ),
  }),
});

export const removeCoursesSchema = z.object({
  body: z.object({
    courseIds: z
      .array(
        z.string({ error: "Course ID is required" })
          .trim()
          .min(1, "Course ID cannot be empty")
          .pipe(
            z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
              message: "Invalid course ID format",
            })
          ),
        { error: "CourseIds must be a list of course IDs" }
      )
      .min(1, "At least one course ID is required"),
  }),
});