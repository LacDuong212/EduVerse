import mongoose from "mongoose";
import { isValidNumber } from "libphonenumber-js";
import { z } from "zod";
import { complexPasswordSchema } from "#modules/auth/auth.validation.js";

export const userIdSchema = z.union([
  z.instanceof(mongoose.Types.ObjectId),
  z.string("User ID is required")
    .trim()
    .min(1, "User ID cannot be empty")
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid user ID format",
    })
]);

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

export const phoneSchema = z.preprocess(
  (val) => {
    if (typeof val === "string") {
      const trimmed = val.trim();
      return trimmed;
    }
    return val;
  },
  z.string("Phone number must be a string")
    .nullish()
    .refine(
      (val) => {
        if (!val) return true;
        return isValidNumber(val, "VN");
      },
      { message: "Invalid phone number format" }
    )
);

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