import mongoose from "mongoose";
import Enum from "#utils/enum.js";
import Category from "#modules/category/category.model.js";
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
export const UPDATE_STATUS_ENUM = new Enum({
  none: "none",
  pending: "pending",
  rejected: "rejected"
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: null },
  description: { type: String, default: null },
  image: { type: String, default: null },
  tags: { type: [String], default: [] },

  price: { type: Number, min: 0, default: null },
  discountPrice: { type: Number, min: 0, default: null },
  enableDiscount: { type: Boolean, default: false },

  language: { type: String },  // !
  level: { type: String, enum: LEVEL_ENUM.values(), default: LEVEL_ENUM.all },
  duration: { type: Number, min: 0, default: 0 },
  durationUnit: { type: String, enum: DURATION_UNIT_ENUM.values(), default: DURATION_UNIT_ENUM.second },

  sectionsCount: { type: Number, min: 0, default: 0 },
  lecturesCount: { type: Number, min: 0, default: 0 },
  studentsEnrolled: { type: Number, min: 0, default: 0 },

  thumbnail: { type: String, default: null },
  previewVideo: { type: String, default: null },

  status: { type: String, enum: STATUS_ENUM.values(), default: STATUS_ENUM.draft },
  previousStatus: { type: String, enum: STATUS_ENUM.values(), default: null },

  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  subCategory: { type: String, default: null },

  rating: {
    count: { type: Number, min: 0, default: 0 },
    total: { type: Number, min: 0, default: 0 },
    stars: {
      1: { type: Number, min: 0, default: 0 },
      2: { type: Number, min: 0, default: 0 },
      3: { type: Number, min: 0, default: 0 },
      4: { type: Number, min: 0, default: 0 },
      5: { type: Number, min: 0, default: 0 }
    },
  },

  instructor: {
    ref: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: String,
    avatar: String
  },

  pendingUpdate: {
    data: { type: mongoose.Schema.Types.Mixed, default: null },
    submittedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: UPDATE_STATUS_ENUM.values(),
      default: UPDATE_STATUS_ENUM.none
    }
  },

  isPrivate: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

courseSchema.index({
  title: "text",
  subtitle: "text",
  tags: "text"
}, {
  weights: { title: 10, tags: 5, subtitle: 2 },
  name: "CourseSearchIndex",
  language_override: "dummy_field_name"
});
courseSchema.index({ status: 1, isPrivate: 1, isDeleted: 1 });
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ "instructor.ref": 1, isDeleted: 1 });
courseSchema.index({ studentsEnrolled: -1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ previewVideo: 1 })
courseSchema.index({ "pendingUpdate.data.previewVideo": 1 });

courseSchema.virtual("curriculum", {
  ref: "Curriculum",
  localField: "_id",
  foreignField: "courseId",
  justOne: true
});
courseSchema.set("toJSON", { virtuals: true });
courseSchema.set("toObject", { virtuals: true });

export default mongoose.model("Course", courseSchema);