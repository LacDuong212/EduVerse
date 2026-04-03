import mongoose from "mongoose";
import { z } from "zod";
import { limitSchema } from "#utils/pagination.js";

const notifIdSchema = z.string("Notification ID is required")
  .trim()
  .min(1, "Notification ID cannot be empty")
  .pipe(
    z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid notification ID format",
    })
  );

export const notifIdParams = z.object({
  params: z.object({
    id: notifIdSchema
  })
});

export const limitQuery = z.object({
  query: z.object({
    limit: limitSchema(99, 99)
  })
});