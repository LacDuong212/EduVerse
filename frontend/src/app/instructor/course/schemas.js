import { z } from "zod";
import { mapZodErrors } from "@/utils/mapper";

const MAX_LENGTH = {
  title: 96,
  subtitle: 186,
  description: 2000,
  secTitle: 128,
  lecTitle: 186,
  lecDesc: 360
};

const oId = (Name = "Field") => z.string(`${Name} ID is required.`)
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, `Invalid ${Name.toLowerCase()} ID format.`);

const videoIdSchema = (message = "Invalid Video ID format.") => z.string()
  .trim()
  .refine(
    (val) => val.startsWith("LEC") || /^1766.*\.mp4$/.test(val),
    { message }
  );

export const courseId = oId("Course");
export const categoryId = oId("Category");
export const sectionId = oId("Section");
export const lectureId = oId("Lecture");

const discountValidation = (data, ctx) => {
  if (data.enableDiscount) {
    if (data.discountPrice === undefined || data.discountPrice === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Discount price is required when discount is enabled.",
        path: ["discountPrice"],
      });
    } else if (data.price && data.discountPrice >= data.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Discount price must be less than the original price.",
        path: ["discountPrice"],
      });
    }
  }
};

export const lecture = z.object({
  lecId: lectureId.nullish(),
  title: z.string("Lecture title is required.")
    .trim()
    .min(1, "Lecture video cannot be empty.")
    .max(MAX_LENGTH.lecTitle, "Lecture title is too long."),
  videoId: videoIdSchema("Lecture video is required and must be valid."),
  duration: z.coerce.number().min(0).default(0),
  description: z.string("Invalid lecture description.")
    .trim()
    .max(MAX_LENGTH.lecDesc, "Lecture description is too long.")
    .nullish(),
  isFree: z.boolean().default(false),
});

export const section = z.object({
  secId: sectionId.nullish(),
  title: z.string("Section title is required.")
    .trim()
    .min(1, "Section title cannot be empty.")
    .max(MAX_LENGTH.secTitle, "Section title is too long."),
  lectures: z.array(lecture, "Section should have at least one lecture.").min(1, "Section should have at least one lecture."),
});

export const validator = (data, schema) => {
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
export const step2Fields = ["image", "thumbnail", "previewVideo"];
export const step3Fields = ["curriculum"];
export const step4Fields = ["tags"];

const step1Schema = z.object({
  title: z.string("Course title is required.")
    .trim()
    .min(1, "Course title cannot be empty.")
    .max(MAX_LENGTH.title, "Course title is too long."),
  subtitle: z.string()
    .trim()
    .max(MAX_LENGTH.subtitle, "Subtitle is too long.")
    .nullish(),
  categoryId: z.string("Category is required.")
    .trim()
    .min(1, "Category cannot be empty.")
    .regex(/^[0-9a-fA-F]{24}$/, "Please provide a valid category."),
  level: z.string("Level is required.")
    .min(1, "Level cannot be empty."),
  language: z.string("Language is required.")
    .min(1, "Language cannot be empty."),
  price: z.coerce.number("Price must be a valid number.")
    .min(0, "Price must be 0 or greater."),
  discountPrice: z.coerce
    .number("Discount price must be a number.")
    .min(0, "Discount price must be 0 or greater.")
    .nullish(),
  enableDiscount: z.boolean("Invalid boolean value."),
  description: z.string()
    .trim()
    .max(MAX_LENGTH.description, "Course description is too long.")
    .nullish(),
}).superRefine(discountValidation);

const step2Schema = z.object({
  image: z.string("Image URL is required.")
    .trim()
    .url("Invalid image URL."),
  thumbnail: z.string()
    .trim()
    .url("Invalid thumbnail URL.")
    .nullish(),
  previewVideo: videoIdSchema("Invalid preview video format.")
    .nullish(),
});

const step3Schema = z.object({
  curriculum: z.object({
    sections: z.array(section, "Curriculum should have at least one section.")
      .min(1, "Curriculum should have at least one section.")
  }, "Curriculum should contain a list of sections."),
});

const step4Schema = z.object({
  tags: z.array(z.string("Invalid tag.")
    .trim()
    .min(2, "Each tag must have at least 2 characters.")
    .max(25, "Each tag must be under 25 characters."),
    "Tags should be a list of tags."
  ).max(14, "Maximum 14 tags allowed.")
    .optional(),
});

export const validateStep1 = (data) => validator(data, step1Schema);
export const validateStep2 = (data) => validator(data, step2Schema);
export const validateStep3 = (data) => validator(data, step3Schema);
export const validateStep4 = (data) => validator(data, step4Schema);

export const validateCourse = (data) => {
  const validators = [validateStep1, validateStep2, validateStep3, validateStep4];

  let validateSuccess = true;
  let allErrors = {};
  let firstErrorStep = null;

  validators.forEach((validator, index) => {
    const { success, errors } = validator(data);

    if (!success) {
      validateSuccess = false;
      allErrors = { ...allErrors, ...errors };
      if (firstErrorStep === null) firstErrorStep = index + 1;
    }
  });

  return { success: validateSuccess, errors: allErrors, step: firstErrorStep };
};