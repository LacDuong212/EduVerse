import mongoose from "mongoose";
import { z } from "zod";
import { TYPE_ENUM } from "./notification.model.js";
import { limitSchema } from "#utils/pagination.js";

export const notifIdSchema = z.string("Notification ID is required")
  .trim()
  .min(1, "Notification ID cannot be empty")
  .pipe(
    z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid notification ID format",
    })
  );

export const typeSchema = z.enum(TYPE_ENUM.values(), {
  error: (iss) => {
    return {
      message: `Invalid value. Only accepts: ${allowedOptions.join(", ")}`
    };
  }
}).nullish();

export const messageSchema = z.string("Notification message is required")
  .trim()
  .min(1, "Notification message cannot be empty")
  .max(500, "Notification message is too long");

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