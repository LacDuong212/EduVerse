import { success, z } from "zod";
import { mapZodErrors } from "@/utils/mapper";

const MAX_LENGTH = {
  title: 96,
  subtitle: 186,
  description: 2000,

};

const oId = (Name = "Field") =>
  z.string(`${Name} ID is required.`)
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, `Invalid ${Name.toLowerCase()} ID format.`);

const optionalString = (max, Name = "Field") =>
  z.string().trim().max(max, `${Name} is too long.`).optional().or(z.literal(""));

export const courseId = oId("Course");
export const categoryId = oId("Category");
export const lectureId = oId("Lecture");

const title = z.string("Course title is required.").trim().min(1, "Course title is required.").max(MAX_LENGTH.title);
const subtitle = optionalString(MAX_LENGTH.subtitle, "Subtitle");
const description = optionalString(MAX_LENGTH.description, "Description");

const image = z.string().trim().url("Invalid image URL.");
const thumbnail = z.string().trim().url("Invalid thumbnail URL.").optional().or(z.literal(""))

const language = z.string("Language is required.").min(1, "Language is required.");
const level = z.string("Level is required.").min(1, "Level is required.");
const price = z.coerce.number("Price must be 0 or greater.").min(0, "Price must be 0 or greater.");
const discountPrice = z.number("Discount price must be 0 or greater.").min(0).optional().nullable();

const tags = z
  .array(
    z.string()
      .trim()
      .min(2, "Each tag must have at least 2 characters.")
      .max(25, "Each tag must be under 25 characters.")
  )
  .max(14, "Maximum 14 tags allowed.")
  .optional();

export const lecture = z.object({
  lecId: z.string().optional(),
  title: z.string().trim().min(1, "Lecture title is required.").max(100, "Lecture title is too long."),
  videoId: z.string("Lecture video is required.").trim().min(1, "Lecture video cannot be empty."),
  duration: z.coerce.number().min(0).default(0),
  isFree: z.boolean().default(false),
});

export const section = z.object({
  secId: z.string().optional(),
  title: z.string().trim().min(1, "Section title is required.").max(100, "Section title is too long."),
  lectures: z.array(lecture).min(1, "Section must have at least one lecture."),
});

export const curriculum = z.object({
  sections: z.array(section)
    .min(1, "Curriculum should contain at least one section")
}, "Curriculum should contain an array of sections");

const discountValidation = (data, ctx) => {
  if (data.enableDiscount) {
    if (data.discountPrice === undefined || data.discountPrice === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Discount price is required.",
        path: ["discountPrice"],
      });
    } else if (data.price && data.discountPrice >= data.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Discount must be less than original price.",
        path: ["discountPrice"],
      });
    }
  }
};

const baseCourseFields = {
  title,
  subtitle,
  description,
  tags,
  price,
  enableDiscount: z.boolean(),
  discountPrice,
  categoryId,
  language,
  level,
  image,
  thumbnail,
  previewVideo: z.string().trim().optional().or(z.literal("")),
  curriculum: z.array(section).min(1, "At least one section required"),
  isPrivate: z.boolean(),
};

export const course = z.object({
  title,
  language,
  level,
  price,
  enableDiscount: z.boolean(),
  discountPrice,
  categoryId,
  image,
  curriculum: curriculum,
}).superRefine(discountValidation);

export const validateCourse = z.object(baseCourseFields).partial().superRefine(discountValidation);

const validator = (data, schema) => {
  const validation = schema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      errors: mapZodErrors(validation.error),
    };
  }

  return {
    success: true,
    errors: null,
  }
};

export const step1Fields = [
  "title", "subtitle", "categoryId", "level",
  "language", "price", "discountPrice",
  "enableDiscount", "description",
  // "isPrivate",
];

const step1Schema = z.object({
  title,
  price,
  categoryId,
  language,
  level,
}).superRefine(discountValidation);

export const validateStep1 = (data) => validator(data, step1Schema);