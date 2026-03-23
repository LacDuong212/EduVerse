import mongoose from "mongoose";
import { z } from "zod";
import { pageSchema, limitSchema } from "#utils/pagination.js";
import * as CONSTANTS from "./course.constant.js"
import { LEVEL_ENUM } from "./course.model.js";

export const courseIdSchema = z.string("Course ID is required")
  .trim()
  .min(1, "Course ID cannot be empty")
  .pipe(
    z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid course ID format",
    })
  );

const titleSchema = z.string("Course title is required")
  .trim()
  .min(1, "Course title cannot be empty")
  .max(CONSTANTS.TITLE_MAX_LENGTH, "Course title too long.");

const subtitleSchema = z.string()
  .trim()
  .max(CONSTANTS.SUBTITLE_MAX_LENGTH, "Course subtitle too long")
  .optional()
  .or(z.literal(""));

const descriptionSchema = z.string()
  .trim()
  .max(CONSTANTS.DESCRIPTION_MAX_LENGTH, "Course description too long")
  .optional()
  .or(z.literal(""));

const categoryIdSchema = z.string("Category ID is required")
  .trim()
  .min(1, "Category ID cannot be empty")
  .pipe(
    z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid category ID format",
    })
  );

const languageSchema = z.string("Language is required");

const levelSchema = z.string("Level is required");

const priceSchema = z.number("Price is required")
  .min(0, "Price must be 0 or greater");

const discountPriceSchema = z.number()
  .min(0, "Discount price must be 0 or greater")
  .optional()
  .nullable();

const imageSchema = z.string("Course image is required")
  .trim()
  .url("Please enter a valid image URL")
  .min(1, "Course image is required");

const tagsSchema = z
  .array(
    z.string()
      .trim()
      .min(2, "Each tag must have at least 2 characters")
      .max(25, "Each tag must be under 25 characters")
  )
  .max(14, "Maximum 14 tags allowed")
  .optional()
  .default([]);

export const courseQueryRequest = z.object({
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
      z.enum(LEVEL_ENUM.values(), "Level option not found")
        .optional()
    ),

    price: z.enum(["free", "paid", "all"], "Price option not found")
      .optional()
      .default("all"),

    sort: z.enum([
      "newest",
      "oldest",
      "priceHighToLow",
      "priceLowToHigh",
      "mostPopular",
      "leastPopular",
      "ratingHighToLow",
      "ratingLowToHigh",
    ], "Sort option not found")
      .optional()
      .default("newest"),

    tag: z.string().trim().optional().transform((val) => val?.toLowerCase()),
  })
});

export const idParamRequest = z.object({
  params: z.object({
    id: courseIdSchema,
  })
});

export const courseReviewsRequest = z.object({
  params: z.object({
    id: courseIdSchema,
  }),
  query: z.object({
    page: pageSchema,
    limit: limitSchema(5, 50),
  })
});

export const limitQueryRequest = z.object({
  query: z.object({
    limit: limitSchema(20, 100),
  })
});

export const step1Request = z.object({
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