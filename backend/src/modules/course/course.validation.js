import mongoose from "mongoose";
import { z } from "zod";
import { pageSchema, limitSchema } from "#utils/pagination.js";
import * as CONSTANTS from "./course.constant.js"
import { LEVEL_ENUM } from "./course.model.js";

const objectIdSchema = (Name = "Field") => z.union([
  z.instanceof(mongoose.Types.ObjectId),
  z.string(`${Name} ID is required`)
    .trim()
    .min(1, `${Name} ID cannot be empty`)
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: `Invalid ${Name.toLowerCase()} ID format`,
    })
]);

export const courseIdSchema = objectIdSchema("Course");

const titleSchema = z.string("Course title is required")
  .trim()
  .min(1, "Course title cannot be empty")
  .max(CONSTANTS.TITLE_MAX_LENGTH, "Course title is too long");

const subtitleSchema = z.string()
  .trim()
  .max(CONSTANTS.SUBTITLE_MAX_LENGTH, "Course subtitle is too long");

const descriptionSchema = z.string()
  .trim()
  .max(CONSTANTS.DESCRIPTION_MAX_LENGTH, "Course description is too long");

const categoryIdSchema = z.string("Category ID is required")
  .trim()
  .min(1, "Category ID cannot be empty")
  .pipe(
    z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid category ID format",
    })
  );

const languageSchema = z.string("Language is required");

const levelSchema = z.enum(LEVEL_ENUM.values(), {
  error: (iss) => {
    return `Level option not found for provided value: ${iss.input ?? "unknown"}`;
  }
});

const priceSchema = z.coerce.number().min(0, "Price must be 0 or greater");

const discountPriceSchema = z.coerce.number().min(0, "Discount must be 0 or greater");

const imageSchema = z.string("Course image is required")
  .trim()
  .url("Please enter a valid image URL")
  .min(1, "Course image is required");

const thumbnailSchema = z.string("")
  .trim()
  .url("Invalid thumbnail URL")
  .nullish();

const tagsSchema = z
  .array(
    z.string()
      .trim()
      .min(2, "Each tag must have at least 2 characters")
      .max(25, "Each tag must be under 25 characters")
  )
  .max(14, "Maximum 14 tags allowed")
  .optional();

const aiDataSchema = z.object({
  summary: z.string().optional(),
  lessonNotes: z.record(z.any()).optional(),
  quizzes: z.array(z.any()).optional(),
  status: z.string().optional(),
});

export const lectureIdSchema = objectIdSchema("Lecture");

const lectureSchema = z.object({
  lecId: lectureIdSchema.nullish(),
  _id: objectIdSchema("Lecture").nullish(),
  title: z.string().trim().min(1, "Lecture title is required").max(100, "Lecture title is too long"),
  videoId: z.string("Lecture video is required")
    .trim()
    .min(1, "Lecture video cannot be empty"),
  duration: z.coerce.number().min(0).default(0),
  isFree: z.boolean().default(false),
});

const sectionSchema = z.object({
  secId: objectIdSchema("Section").nullish(),
  _id: objectIdSchema("Section").nullish(),
  title: z.string().trim().min(1, "Section title is required").max(100, "Section title is too long"),
  lectures: z.array(lectureSchema).min(1, "Section must have at least one lecture"),
});

export const curriculumSchema = z.object({
  sections: z.array(sectionSchema)
    .min(1, "Curriculum should contain at least one section")
}, "Curriculum should contain an array of sections");

const baseCourseFields = {
  title: titleSchema,
  subtitle: subtitleSchema,
  description: descriptionSchema,
  tags: tagsSchema,
  price: priceSchema,
  enableDiscount: z.boolean(),
  discountPrice: discountPriceSchema.nullish(),
  categoryId: categoryIdSchema,
  language: languageSchema,
  level: levelSchema,
  image: imageSchema,
  thumbnail: thumbnailSchema,
  previewVideo: z.string().trim().nullish().pipe(
    z.string().min(1, "Preview video cannot be empty if provided").nullish()
  ),
  curriculum: curriculumSchema, // = { sections: [...] }
  isPrivate: z.boolean(),
};

const discountValidation = (data, ctx) => {
  if (data.enableDiscount) {
    if (data.discountPrice === undefined || data.discountPrice === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Discount price is required when discount is enabled",
        path: ["discountPrice"],
      });
    } else if (data.price !== undefined && data.discountPrice >= data.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Discount must be less than the original price",
        path: ["discountPrice"],
      });
    }
  }
};

export const courseSchema = z.object({
  title: titleSchema,
  language: languageSchema,
  level: levelSchema,

  price: priceSchema,
  enableDiscount: z.boolean().default(false),
  discountPrice: discountPriceSchema.nullish(),

  categoryId: categoryIdSchema,

  image: imageSchema,

  curriculum: curriculumSchema,
}).superRefine(discountValidation);

export const updateCourseSchema = z.object(baseCourseFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Please provide at least one field to update",
  })
  .superRefine(discountValidation);

export const submitCourseSchema = z.object(baseCourseFields).partial();

export const priceFilterEnum = ["free", "paid", "all"];
export const sortFilterEnum = [
  "newest",
  "oldest",
  "priceHighToLow",
  "priceLowToHigh",
  "mostPopular",
  "leastPopular",
  "ratingHighToLow",
  "ratingLowToHigh",
];

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

    price: z.enum(priceFilterEnum, "Price option not found")
      .optional()
      .default(LEVEL_ENUM.all),

    sort: z.enum(sortFilterEnum, "Sort option not found")
      .optional()
      .default(sortFilterEnum[0]),

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

export const generateAiParams = z.object({
  params: z.object({
    id: courseIdSchema,
    lecId: lectureIdSchema,
  })
});