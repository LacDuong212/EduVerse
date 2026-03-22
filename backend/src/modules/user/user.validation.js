import { z } from "zod";
import { complexPasswordSchema } from "#modules/auth/auth.validation.js";

export const optionalUrlSchema = z
  .string("Must be a valid URL string")
  .trim()
  .url("Invalid URL format")
  .nullish()
  .or(z.literal(""));

const baseSocial = z
  .string("Link must be a string")
  .trim()
  .nullish()
  .or(z.literal(""));

export const nameSchema = z.string("Name cannot be null")
  .trim()
  .min(2, "Name must have at least 2 characters")
  .max(70, "Name is too long");

export const phoneSchema = z.string("Phone number must be a string")
  .trim()
  .regex(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/, "Invalid phone number format")
  .nullish()
  .or(z.literal(""));

export const bioSchema = z.string("Bio must be a string")
  .trim()
  .max(200, "Bio cannot exceed 200 characters")
  .nullish()
  .or(z.literal(""));

export const facebookSchema = baseSocial.pipe(
  z.string()
    .regex(/^(https?:\/\/)?(www\.)?facebook\.com\/.+/i, "Must be a valid Facebook URL")
    .optional().or(z.literal(""))
);

export const instagramSchema = baseSocial.pipe(
  z.string()
    .regex(/^(https?:\/\/)?(www\.)?instagram\.com\/.+/i, "Must be a valid Instagram URL")
    .optional().or(z.literal(""))
);

export const linkedinSchema = baseSocial.pipe(
  z.string()
    .regex(/^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/.+/i, "Must be a valid LinkedIn URL")
    .optional().or(z.literal(""))
);

export const youtubeSchema = baseSocial.pipe(
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