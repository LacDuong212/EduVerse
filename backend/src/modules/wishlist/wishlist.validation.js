import { z } from "zod";
import mongoose from "mongoose";

export const addToWishlistSchema = z.object({
  body: z.object({
    courseId: z.string().refine(
      val => mongoose.Types.ObjectId.isValid(val),
      "Invalid course ID"
    )
  })
});