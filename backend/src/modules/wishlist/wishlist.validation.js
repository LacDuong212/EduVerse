import { z } from "zod";
import { courseIdSchema } from "#modules/course/course.validation.js";

export const courseIdRequest = z.object({
  body: z.object({
    courseId: courseIdSchema
  })
});

export const courseIdQuery = z.object({
  query: z.object({
    courseId: courseIdSchema
  })
});