import { z } from "zod";

export const chatbotRequest = z.object({
  body: z.object({
    sessionId: z.string("Session ID is required").optional(),
    message: z.string("Message is required"),
    language: z.enum(["en", "vi"]).optional().default("en")
  })
});