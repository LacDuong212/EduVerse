import { z } from "zod";

export const chatbotRequest = z.object({
  body: z.object({
    sessionId: z.string("Session ID is required").optional(),
    message: z.string("Message is required").min(1, "Message cannot be empty"),
    language: z.preprocess(
      (val) => {
        if (typeof val === "string") return val.toLowerCase();
        return val;
      },
      z.enum(["en", "vi"],).optional().default("en")
    ),
  })
});