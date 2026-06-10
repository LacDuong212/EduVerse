import { userIdSchema } from "#modules/user/user.validation.js";
import mongoose from "mongoose";
import { z } from "zod";

export const notifyRequest = z.object({
  body: z.object({
    userIds: z.array(userIdSchema, "Should be a list of user IDs")
      .min(1, "At least one user ID is required"),
  })
});