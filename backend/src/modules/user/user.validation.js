import { z } from "zod";
import { complexPasswordSchema } from "#modules/auth/auth.validation.js";

const optionalUrlSchema = z
  .string({ error: "Must be a valid URL string" })
  .trim()
  .url("Invalid URL format")
  .optional()
  .nullable()
  .or(z.literal(""));

const baseSocial = z
  .string({ error: "Link must be a string" })
  .trim()
  .optional()
  .nullable()
  .or(z.literal(""));

const facebookSchema = baseSocial.pipe(
  z.string()
    .regex(/^(https?:\/\/)?(www\.)?facebook\.com\/.+/i, "Must be a valid Facebook URL")
    .optional().or(z.literal(""))
);

const instagramSchema = baseSocial.pipe(
  z.string()
    .regex(/^(https?:\/\/)?(www\.)?instagram\.com\/.+/i, "Must be a valid Instagram URL")
    .optional().or(z.literal(""))
);

const linkedinSchema = baseSocial.pipe(
  z.string()
    .regex(/^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/.+/i, "Must be a valid LinkedIn URL")
    .optional().or(z.literal(""))
);

const youtubeSchema = baseSocial.pipe(
  z.string()
    .regex(/^(https?:\/\/)?(www\.)?youtube\.com\/(c\/|channel\/|user\/|@).+/i, "Must be a valid YouTube URL")
    .optional().or(z.literal(""))
);


export const changePasswordRequest = z.object({
  body: z.object({
    oldPassword: z.string("Old password is required")
      .min(1, "Old password cannot be empty"),
    newPassword: complexPasswordSchema,
  }).refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password cannot be the same as the old password",
    path: ["newPassword"],
  }),
});

export const updateInterestsRequest = z.object({
  body: z.object({
    interests: z.array(
      z.string("An interest cannot be null")
        .trim()
        .min(1, "An interest cannot be empty")
        .max(100, "This interest is too long"),
      "Interests is required"
    ),
  })
});

export const updateProfileRequest = z.object({
  body: z.object({
    name: z.string("Name cannot be null")
      .trim()
      .min(2, "Name must have at least 2 characters")
      .max(70, "Name is too long")
      .optional(),
    pfpImg: optionalUrlSchema,
    phonenumber: z.string({ error: "Phone number must be a string" })
      .trim()
      .regex(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/, "Invalid phone number format")
      .optional()
      .nullable()
      .or(z.literal("")),
    bio: z.string("Bio must be a string")
      .trim()
      .max(200, "Bio cannot exceed 200 characters")
      .optional()
      .nullable()
      .or(z.literal("")),
    website: optionalUrlSchema,
    socials: z.object({
      facebook: facebookSchema,
      instagram: instagramSchema,
      linkedin: linkedinSchema,
      youtube: youtubeSchema,
    }).optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  })
});