import { z } from "zod";
import { courseIdSchema } from "#modules/course/course.validation.js";

export const addToCartRequest = z.object({
  body: z.object({
    courseId: courseIdSchema,
  }),
});

export const removeCoursesRequest = z.object({
  body: z.object({
    courseIds: z
      .array(courseIdSchema, "CourseIds must be a list of course IDs")
      .min(1, "At least one course ID is required"),
  }),
});