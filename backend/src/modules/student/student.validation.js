import { z } from "zod";
import { courseIdSchema, lectureIdSchema } from "#modules/course/course.validation.js";
import {
  nameSchema,
  optionalUrlSchema,
  phoneSchema,
  bioSchema,
  facebookSchema,
  instagramSchema,
  linkedinSchema,
  youtubeSchema
} from "#modules/user/user.validation.js";
import { limitSchema, pageSchema } from "#utils/pagination.js";

const interestsSchema = z.array(
  z.string("An interest cannot be null")
    .trim()
    .min(1, "An interest cannot be empty")
    .max(100, "An interest cannot be too long"),
  "Interests are required"
);

export const updateProfileRequest = z.object({
  body: z.object({
    name: nameSchema.optional(),
    avatar: optionalUrlSchema,
    phone: phoneSchema,
    bio: bioSchema,
    website: optionalUrlSchema,
    socials: z.object({
      facebook: facebookSchema,
      instagram: instagramSchema,
      linkedin: linkedinSchema,
      youtube: youtubeSchema,
    }).optional(),
    interests: interestsSchema.optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  })
});

export const updateInterestsRequest = z.object({
  body: z.object({
    interests: interestsSchema,
  })
});

export const coursesQueryRequest = z.object({
  query: z.object({
    page: pageSchema,
    limit: limitSchema(6, 50),

    search: z.string().trim().optional().transform((val) => val?.toLowerCase()),
    sort: z.enum([
      "enrolledAsc",
      "enrolledDesc",
      "activityAsc",
      "activityDesc",
      "titleAsc",
      "titleDesc",
    ], "Sort option not found")
      .optional()
      .default("activityDesc"),
  })
});

export const courseIdParam = z.object({
  params: z.object({
    courseId: courseIdSchema,
  })
});

export const updateLectureProgressRequest = z.object({
  params: z.object({
    courseId: courseIdSchema,
    lecId: lectureIdSchema
  }),
  body: z.object({
    currentTimeSec: z.coerce.number({ error: "Current time must be a number" })
      .min(0, "Current time cannot be negative")
      .default(0),
    durationSec: z.coerce.number({ error: "Duration must be a number" })
      .min(0, "Duration cannot be negative")
      .default(0),
    isCompleted: z.boolean().default(false),
    deltaTimeSec: z.coerce.number()
      .min(0)
      .max(60, "Delta time seems suspiciously high")
      .default(0),
    isNewSession: z.boolean().default(false),
  }, "Request body is needed")
    .superRefine((data, ctx) => {
      if (data.currentTimeSec > data.durationSec && data.durationSec > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Current time cannot exceed lecture duration",
          path: ["currentTimeSec"],
        });
      }
    })
});