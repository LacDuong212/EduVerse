import mongoose from "mongoose";
import Enum from "#utils/enum.js";
import DraftVideo from "#modules/video/draft-video.model.js";

export const AI_DATA_STATUS = new Enum({
  none: "none",
  processing: "processing",
  completed: "completed",
  failed: "failed"
});
export const UPDATE_STATUS_ENUM = new Enum({
  none: "none",
  pending: "pending",
  rejected: "rejected"
});

const curriculumSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
    unique: true
  },
  sections: [{
    title: { type: String, required: true },
    lectures: [{
      title: { type: String, required: true },
      videoId: { type: String, required: true },
      duration: { type: Number, required: true },
      isFree: { type: Boolean, default: false },
      aiData: {
        summary: String,
        lessonNotes: {
          keyConcepts: [{
            term: String,
            definition: String
          }],
          mainPoints: [String],
          practicalTips: [String]
        },
        quizzes: [{
          question: String,
          options: [String],
          correctAnswer: String,
          explanation: String,
          topic: { type: String, default: "General Knowledge" }
        }],
        status: { type: String, enum: AI_DATA_STATUS.values(), default: AI_DATA_STATUS.none }
      }
    }]
  }],
  pendingUpdate: {
    data: { type: mongoose.Schema.Types.Mixed, default: null },
    submittedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: UPDATE_STATUS_ENUM.values(),
      default: UPDATE_STATUS_ENUM.none
    }
  },
}, { timestamps: true });

curriculumSchema.index({ "sections.lectures.videoId": 1 });

export default mongoose.model("Curriculum", curriculumSchema);