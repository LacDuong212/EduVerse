import mongoose from "mongoose";
import { z } from "zod";
import { courseIdSchema } from "#modules/course/course.validation.js";
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
import { pageSchema, limitSchema } from "#utils/pagination.js";

const idSchema = z.string("Instructor ID is required")
  .trim()
  .min(1, "Instructor ID cannot be empty")
  .pipe(
    z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid instructor ID format",
    })
  );

const occupationSchema = z.string("Occupation cannot be null")
  .trim()
  .min(2, "Occupation must have at least 2 characters")
  .max(80, "Occupation is too long");

const introductionSchema = z.string()
  .trim()
  .max(1000, "Introduction is too long")
  .optional()
  .or(z.literal(""));

const addressSchema = z.string()
  .trim()
  .max(200, "Address is too long")
  .optional()
  .or(z.literal(""));

const skillItemSchema = z.object({
  name: z.string("Skill name is required")
    .trim()
    .min(1, "Skill name cannot be empty"),
  level: z.coerce.number()
    .min(0, "Level must be at least 0")
    .max(100, "Level cannot exceed 100")
    .default(0),
});

const eduItemSchema = z.object({
  institution: z.string("Institution is required")
    .trim()
    .min(1, "Institution cannot be empty"),
  degree: z.string().trim().default(""),
  addedAt: z.coerce.date().default(() => new Date()),
});

export const insIdParamRequest = z.object({
  params: z.object({
    insId: idSchema,
  })
});

export const limitQueryRequest = z.object({
  query: z.object({
    limit: limitSchema(5, 50),
  })
});

export const updateProfileRequest = z.object({
  body: z.object({
    // user part
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

    // instructor part
    occupation: occupationSchema.optional(),
    introduction: introductionSchema,
    address: addressSchema,
    skills: z.array(skillItemSchema).optional(),
    education: z.array(eduItemSchema).optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  })
});

export const courseIdParamRequest = z.object({
  params: z.object({
    courseId: courseIdSchema,
  })
});

export const studentsQueryRequest = z.object({
  query: z.object({
    page: pageSchema,
    limit: limitSchema(10, 50),

    search: z.string().trim().optional().transform((val) => val?.toLowerCase()),
    sort: z.enum([
      "nameAsc",
      "nameDesc",
      "enrolledAsc",
      "enrolledDesc",
    ], "Sort option not found")
      .optional()
      .default("enrolledDesc"),
  })
});