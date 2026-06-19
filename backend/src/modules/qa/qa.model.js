import mongoose from "mongoose";

const qaSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lectureId: {
      type: String,
      default: null,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxLength: 20000,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QnA",
      default: null,
    },
    isInstructorPost: {
      type: Boolean,
      default: false,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

qaSchema.index({ courseId: 1, parentId: 1, isDeleted: 1 });
qaSchema.index({ courseId: 1, lectureId: 1, isDeleted: 1 });

export default mongoose.model("QnA", qaSchema);
