import { z } from "zod";
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
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  })
});