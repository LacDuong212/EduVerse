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
          message: "Invalid Course ID format",
        })
      ),
  }),
});