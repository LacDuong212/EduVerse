import { z } from "zod";
import { pageSchema, limitSchema } from "#utils/pagination.js";

const idSchema = (label) =>
  z.string().trim().min(1, `${label} is required`);

const contentSchema = z
  .string()
  .trim()
  .min(1, "Content is required")
  .max(20000, "Content is too long.");

export const getQnaRequest = z.object({
  params: z.object({ courseId: idSchema("Course ID") }),
  query: z.object({
    page: pageSchema,
    limit: limitSchema(10, 50),
    lectureId: z.string().trim().optional(),
  }),
});

export const createQuestionRequest = z.object({
  params: z.object({ courseId: idSchema("Course ID") }),
  body: z.object({
    content: contentSchema,
    lectureId: z.string().trim().optional().nullable(),
  }),
});

export const createReplyRequest = z.object({
  params: z.object({ questionId: idSchema("Question ID") }),
  body: z.object({
    content: contentSchema,
  }),
});

export const deleteQnaRequest = z.object({
  params: z.object({ id: idSchema("ID") }),
});

export const toggleResolveRequest = z.object({
  params: z.object({ id: idSchema("ID") }),
});
