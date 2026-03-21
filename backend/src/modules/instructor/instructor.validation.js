import mongoose from "mongoose";
import { z } from "zod";

const idSchema = z.string("Instructor ID is required")
  .trim()
  .min(1, "Instructor ID cannot be empty")
  .pipe(
    z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid instructor ID format",
    })
  );

export const insIdParamRequest = z.object({
  params: z.object({
    insId: idSchema,
  })
});

export const limitQueryRequest = z.object({
  query: z.object({
    limit: z.coerce
      .number("Limit must be a number")
      .default(5)
      .transform((val) => Math.min(Math.max(val, 1), 50)),
  })
});