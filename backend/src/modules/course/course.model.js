import mongoose from "mongoose";
import Enum from "#utils/enum.js";
import Category from "#modules/category/category.model.js"; // yes
import Curriculum from "./curriculum.model.js";

export const DURATION_UNIT_ENUM = new Enum({
  second: "second", 
  minute: "minute",
  hour: "hour",
  day: "day",
});
export const LEVEL_ENUM = new Enum({
  all: "all",
  beginer: "beginner",
  intermediate: "intermediate",
  advanced: "advanced"
});
export const STATUS_ENUM = new Enum({
  draft: "draft",
  pending: "pending",
  live: "live",
  blocked: "blocked",
  rejected: "rejected"
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: String,
  description: String,
  image: String,

  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Category",
    required: true 
  },

  subCategory: String,
  language: String,

  instructor: {
    ref: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    avatar: String
  },

  level: { type: String, enum: LEVEL_ENUM.values() },
  duration: Number,
  durationUnit: { type: String, enum: DURATION_UNIT_ENUM.values(), default: DURATION_UNIT_ENUM.second },
  lecturesCount: Number,
  studentsEnrolled: { type: Number, default: 0 },

  rating: {
    average: { type: Number, min: 0, max: 5, default: 0 },
    count: { type: Number, min: 0, default: 0 },
    total: { type: Number, min: 0, default: 0 }
  },

  thumbnail: String,
  previewVideo: String,
  tags: [String],

  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, min: 0, default: null },
  enableDiscount: { type: Boolean, default: false },

  status: { type: String, enum: STATUS_ENUM.values(), default: STATUS_ENUM.draft },

  isPrivate: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});

courseSchema.index({ 
  title: "text", 
  subtitle: "text", 
  tags: "text" 
}, {
  weights: { title: 10, tags: 5, subtitle: 2 },
  name: "CourseSearchIndex"
});

courseSchema.virtual("curriculum", {
  ref: "Curriculum",
  localField: "_id",
  foreignField: "courseId",
  justOne: true
});
courseSchema.set("toJSON", { virtuals: true });
courseSchema.set("toObject", { virtuals: true });

export default mongoose.model("Course", courseSchema);