import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema({
  lectureId: { type: mongoose.Schema.Types.ObjectId, ref: "Lecture", required: true },
  score: { type: Number, required: true, min: 0 },
  totalQuestions: { type: Number, required: true, min: 1 },
  wrongAnswers: {
    type: [
      {
        question: String,
        topic: String
      }
    ],
    default: []
  }
}, { _id: false });

const quizProgressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    quizzes: [quizResultSchema]
}, { timestamps: true });

quizProgressSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.models.QuizProgress || mongoose.model("QuizProgress", quizProgressSchema);