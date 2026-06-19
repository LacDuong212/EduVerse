import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lectureId: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Number,
      required: true,
      min: 0,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxLength: 5000,
    },
    tags: {
      type: [{ type: String, trim: true, maxLength: 50 }],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Primary fetch: all notes for a lecture by a user
noteSchema.index({ userId: 1, lectureId: 1, isDeleted: 1 });
// PDF export / course-level fetch
noteSchema.index({ userId: 1, courseId: 1, isDeleted: 1 });

export default mongoose.model("Note", noteSchema);
