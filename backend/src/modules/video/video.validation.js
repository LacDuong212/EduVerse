import { z } from "zod";
import { courseIdSchema } from "#modules/course/course.validation.js";
import { CONTENT_TYPE } from "./draft-video.model.js";

const contentTypeSchema = z.enum(CONTENT_TYPE, {
  error: (iss) => {
    if (iss.input === undefined) return "Content type is required";
    return `Unsupported file type: ${iss.input}. Allowed types are: ${CONTENT_TYPE.join(", ")}`;
  }
});

export const uploadVideoRequest = z.object({
  body: z.object({

    contentType: contentTypeSchema
  }, "Content type is required")
});