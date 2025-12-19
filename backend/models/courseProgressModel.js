import mongoose from "mongoose";

const { Schema } = mongoose;

const LectureProgressSchema = new Schema(
  {
    lectureId: { type: Schema.Types.ObjectId, required: true },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
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

const CourseProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    totalLectures: { type: Number, default: 0, min: 0 },
    completedLecturesCount: { type: Number, default: 0, min: 0 },
    totalTimeSpentSec: { type: Number, default: 0, min: 0 },
    lastLectureId: { type: Schema.Types.ObjectId },
    lastPositionSec: { type: Number, default: 0, min: 0 },
    lectures: [LectureProgressSchema],
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

CourseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

CourseProgressSchema.virtual("percentage").get(function () {
  if (!this.totalLectures) return 0;
  return Math.round(
    (this.completedLecturesCount / this.totalLectures) * 100
  );
});

const CourseProgress =
  mongoose.models.CourseProgress ||
  mongoose.model("CourseProgress", CourseProgressSchema);

export default CourseProgress;
