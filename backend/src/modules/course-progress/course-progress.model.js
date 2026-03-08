import mongoose from "mongoose";

const { Schema } = mongoose;

export const LECTURE_STATUS_ENUM =["not_started", "in_progress", "completed"] ;

const lectureProgressSchema = new Schema(
  {
    lectureId: { type: Schema.Types.ObjectId, required: true },
    status: {
      type: String,
      enum: LECTURE_STATUS_ENUM,
      default: LECTURE_STATUS_ENUM[0],
    },
    lastPositionSec: { type: Number, default: 0, min: 0 },
    durationSec: { type: Number, default: 0, min: 0 },
    totalTimeSpentSec: { type: Number, default: 0, min: 0 },

    viewCount: { type: Number, default: 0, min: 0 },
    completedAt: Date,
    lastActivityAt: Date,
  },
  { _id: false }
);

const courseProgressSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    totalLectures: { type: Number, default: 0, min: 0 },
    completedLecturesCount: { type: Number, default: 0, min: 0 },
    totalTimeSpentSec: { type: Number, default: 0, min: 0 },
    lastLectureId: { type: Schema.Types.ObjectId },
    lastPositionSec: { type: Number, default: 0, min: 0 },
    lectures: [lectureProgressSchema],
    firstStartedAt: Date,
    lastActivityAt: Date,
    isCompleted: { type: Boolean, default: false },
    aiAssessment: {
      generatedAt: Date,
      overallScore: { type: Number, default: 0 },
      summary: String,
      strengths: [String],
      weaknesses: [String],
      recommendation: String
    }
  },
  { timestamps: true }
);

courseProgressSchema.index({ user: 1, course: 1 }, { unique: true });

courseProgressSchema.virtual("percentage").get(function () {
  if (!this.totalLectures) return 0;
  return Math.round(
    (this.completedLecturesCount / this.totalLectures) * 100
  );
});

export default mongoose.model("CourseProgress", courseProgressSchema) || mongoose.models.CourseProgress;