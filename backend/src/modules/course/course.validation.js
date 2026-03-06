import { z } from "zod";
import * as CONSTANTS from "#constants/course.js"
import { LEVEL_ENUM } from "./course.model.js";

const hexEncodeRegex = /^[0-9a-fA-F]{24}$/;

export const titleSchema = z.string({ required_error: "Course title is required" })
  .trim()
  .min(1, "Course title cannot be empty")
  .max(CONSTANTS.TITLE_MAX_LENGTH, "Course title too long.");

export const subtitleSchema = z.string()
  .trim()
  .max(CONSTANTS.SUBTITLE_MAX_LENGTH, "Course subtitle too long")
  .optional()
  .or(z.literal(""));

export const descriptionSchema = z.string()
  .trim()
  .max(CONSTANTS.DESCRIPTION_MAX_LENGTH, "Course description too long")
  .optional()
  .or(z.literal(""));

export const categoryIdSchema = z.string({ required_error: "Category is required" })
  .trim()
  .regex(hexEncodeRegex, "Invalid Category ID");

export const languageSchema = z.string({ required_error: "Language is required" });

export const levelSchema = z.string({ required_error: "Level is required" });

export const priceSchema = z.number({ required_error: "Price is required" })
  .min(0, "Price must be 0 or greater");

export const discountPriceSchema = z.number()
  .min(0, "Discount price must be 0 or greater")
  .optional()
  .nullable();

export const imageSchema = z.string({ required_error: "Course image is required" })
  .trim()
  .url("Please enter a valid image URL")
  .min(1, "Course image is required");

export const tagsSchema = z
  .array(
    z.string()
      .trim()
      .min(2, "Each tag must have at least 2 characters")
      .max(25, "Each tag must be under 25 characters")
  )
  .max(14, "Maximum 14 tags allowed")
  .optional()
  .default([]);

export const courseQuerySchema = z.object({
  query: z.object({
    page: z.string()
      .optional()
      .transform((val) => Math.max(parseInt(val, 10) || 1, 1)),
    limit: z.string()
      .optional()
      .transform((val) => {
        const parsed = parseInt(val, 10) || 10;
        return Math.min(Math.max(parsed, 1), 100);
      }),

    search: z.string().trim().optional().transform((val) => val?.toLowerCase()),
    category: z.string().trim().optional(),
    language: z.string().trim().optional().transform((val) => val?.toLowerCase()),

    level: z.preprocess(
      (val) => {
        if (typeof val === "string") return val.toLowerCase();
        return val;
      },
      z.enum(LEVEL_ENUM).optional()
    ),

    price: z.enum(["free", "paid", "all"]).optional().default("all"),

    sort: z.enum([
      "newest",
      "oldest",
      "priceHighToLow",
      "priceLowToHigh",
      "mostPopular",
      "leastPopular",
      "ratingHighToLow",
      "ratingLowToHigh",
    ]).optional().default("newest"),
  })
});

export const step1Schema = z.object({
  body: z.object({
    title: titleSchema,
    subtitle: subtitleSchema,
    categoryId: categoryIdSchema,
    language: languageSchema,
    level: levelSchema,
    price: priceSchema,
    enableDiscount: z.boolean().default(false),
    discountPrice: discountPriceSchema,
    description: descriptionSchema,
    isPrivate: z.boolean().default(false),
  })
    .superRefine((data, ctx) => {
      if (data.enableDiscount) {
        if (data.discountPrice === undefined || data.discountPrice === null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Discount price is required when discount is enabled",
            path: ["discountPrice"],
          });
        } else if (data.discountPrice >= data.price) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Discount must be less than the original price",
            path: ["discountPrice"],
          });
        }
      }
    })
});