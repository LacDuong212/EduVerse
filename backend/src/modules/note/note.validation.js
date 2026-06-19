import { z } from "zod";

const lectureIdParam = z.object({
  params: z.object({
    lectureId: z.string().min(1, "lectureId is required"),
  }),
});

const noteIdParam = z.object({
  params: z.object({
    id: z.string().min(1, "id is required"),
  }),
});

export const getNotesRequest = lectureIdParam;

export const createNoteRequest = z.object({
  body: z.object({
    courseId: z.string().min(1, "courseId is required"),
    lectureId: z.string().min(1, "lectureId is required"),
    timestamp: z.number({ required_error: "timestamp is required" }).min(0),
    content: z.string().min(1, "content is required").max(5000),
    tags: z.array(z.string().trim().max(50)).max(10).optional(),
  }),
});

export const updateNoteRequest = noteIdParam.merge(
  z.object({
    body: z
      .object({
        content: z.string().min(1).max(5000).optional(),
        tags: z.array(z.string().trim().max(50)).max(10).optional(),
      })
      .refine((b) => b.content !== undefined || b.tags !== undefined, {
        message: "At least one of content or tags must be provided",
      }),
  })
);

export const deleteNoteRequest = noteIdParam;

export const getCourseNotesRequest = z.object({
  params: z.object({
    courseId: z.string().min(1, "courseId is required"),
  }),
});
