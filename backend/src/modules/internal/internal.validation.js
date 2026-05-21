import { messageSchema as notifMsg, typeSchema as notifType } from "#modules/notification/notification.validation.js";
import { userIdSchema } from "#modules/user/user.validation.js";
import mongoose from "mongoose";
import { z } from "zod";

export const notifyRequest = z.object({
  body: z.object({
    userId: userIdSchema,
    type: notifType,
    message: notifMsg,
  })
});