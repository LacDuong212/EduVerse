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

const subtitleSchema = z.string("Invalid course subtitle")
  .trim()
  .max(CONSTANTS.SUBTITLE_MAX_LENGTH, "Course subtitle is too long");

const descriptionSchema = z.string("Invalid course description")
  .trim()
  .max(CONSTANTS.DESCRIPTION_MAX_LENGTH, "Course description is too long");

const categoryIdSchema = objectIdSchema("Category");

const languageSchema = z.string("Language is required").min(1, "Language cannot be empty");

const levelSchema = z.enum(LEVEL_ENUM.values(), {
  error: (iss) => {
    if (iss.code === "invalid_type") {
      return { message: "Level is required" };
    }
    if (iss.code === "invalid_value") {
      return { message: `Level option not found for: ${iss.input}` };
    }
    return undefined;
  }
});

const priceSchema = z.preprocess(
  (val) => (val === "" || val === null ? undefined : val),
  z.coerce.number("Price must be a valid number")
    .min(0, "Price must be 0 or greater")
);

const discountPriceSchema = z.coerce
  .number("Discount price must be a number")
  .min(0, "Discount must be 0 or greater");

const imageSchema = z.string("Course image is required")
  .trim()
  .min(1, "Course image is required")
  .url("Please enter a valid image URL");

const thumbnailSchema = z.string("Invalid thumbnail")
  .trim()
  .url("Invalid thumbnail URL");

const previewVideoSchema = z.string("Invalid preview video")
  .trim()
  .min(1, "Preview video cannot be empty")
  .refine(
    (val) => val.startsWith("LEC") || /^1766.*\.mp4$/.test(val),
    { message: "Invalid preview video format" }
  );

const tagsSchema = z
  .array(
    z.string("Invalid tag")
      .trim()
      .min(2, "Each tag must have at least 2 characters")
      .max(25, "Each tag must be under 25 characters"),
    "Tags should be a list of tags"
  )
  .max(14, "Maximum 14 tags allowed");

const aiDataSchema = z.object({
  summary: z.string().optional(),
  lessonNotes: z.record(z.any()).optional(),
  quizzes: z.array(z.any()).optional(),
  status: z.string().optional(),
});

export const lectureIdSchema = objectIdSchema("Lecture");

const updateLectureSchema = z.object({
  lecId: lectureIdSchema.nullish(),
  _id: lectureIdSchema.nullish(),
  title: z.string("Lecture title is required")
    .trim()
    .min(1, "Lecture title cannot be empty")
    .max(CONSTANTS.LECTURE_TITLE_MAX_LENGTH, "Lecture title is too long")
    .optional(),
  videoId: z.string("Invalid lecture video")
    .trim()
    .min(1, "Lecture video cannot be empty")
    .refine(
      (val) => val.startsWith("LEC") || /^1766.*\.mp4$/.test(val),
      { message: "Invalid preview video format" }
    ).optional(),
  duration: z.coerce.number().min(0).optional(),
  description: z.string("Invalid lecture description")
    .trim()
    .max(CONSTANTS.LECTURE_DESCRIPTION_MAX_LENGTH, "Lecture description is too long")
    .nullish(),
  isFree: z.boolean().optional(),
}).partial();

const lectureSchema = z.object({
  lecId: lectureIdSchema.nullish(),
  _id: lectureIdSchema.nullish(),
  title: z.string("Lecture video is required")
    .trim()
    .min(1, "Lecture video cannot be empty")
    .max(CONSTANTS.LECTURE_TITLE_MAX_LENGTH, "Lecture title is too long"),
  videoId: z.string("Lecture video is required")
    .trim()
    .min(1, "Lecture video cannot be empty")
    .refine(
      (val) => val.startsWith("LEC") || /^1766.*\.mp4$/.test(val),
      { message: "Invalid preview video format" }
    ),
  duration: z.coerce.number().min(0).default(0),
  description: z.string("Invalid lecture description")
    .trim()
    .max(CONSTANTS.LECTURE_DESCRIPTION_MAX_LENGTH, "Lecture description is too long")
    .nullish(),
  isFree: z.boolean().default(false),
});

export const sectionIdSchema = objectIdSchema("Section");

const updateSectionSchema = z.object({
  secId: sectionIdSchema.nullish(),
  _id: sectionIdSchema.nullish(),
  title: z.string("Section title is required")
    .trim()
    .min(1, "Section title cannot be empty")
    .max(CONSTANTS.SECTION_TITLE_MAX_LENGTH, "Section title is too long").optional(),
  lectures: z.array(updateLectureSchema, "Section should be a list of lectures").optional(),
}).partial();

const sectionSchema = z.object({
  secId: objectIdSchema("Section").nullish(),
  _id: objectIdSchema("Section").nullish(),
  title: z.string("Section title is required")
    .trim()
    .min(1, "Section title cannot be empty")
    .max(CONSTANTS.SECTION_TITLE_MAX_LENGTH, "Section title is too long"),
  lectures: z.array(lectureSchema, "Section should be a list of lectures").min(1, "Section must have at least one lecture"),
});

const updateCurriculumSchema = z.object({
  sections: z.array(updateSectionSchema, "Sections should be a list of sections").optional()
}, "Curriculum should contain sections").optional();

export const curriculumSchema = z.object({
  sections: z.array(sectionSchema, "Sections should be a list of sections")
    .min(1, "Sections should contain at least one section")
}, "Curriculum should contain sections");

const baseCourseFields = {
  title: titleSchema,
  subtitle: subtitleSchema.nullish(),
  description: descriptionSchema.nullish(),
  tags: tagsSchema.nullish(),
  price: priceSchema,
  discountPrice: discountPriceSchema.nullish(),
  enableDiscount: z.boolean(),
  categoryId: categoryIdSchema,
  language: languageSchema,
  level: levelSchema,
  image: imageSchema,
  thumbnail: thumbnailSchema.nullish(),
  previewVideo: previewVideoSchema.nullish(),
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

export const validateCourseSchema = z.object({
  ...baseCourseFields,
}).superRefine(discountValidation);

export const updateCourseSchema = z.object({
  ...baseCourseFields,
  curriculum: updateCurriculumSchema
}).partial()
  .superRefine(discountValidation)
  .refine((data) => Object.keys(data).length > 0, {
    message: "Please provide at least one field to update",
  });

export const submitCourseSchema = z.object({
  ...baseCourseFields,
  curriculum: updateCurriculumSchema
}).partial()
  .superRefine(discountValidation);

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