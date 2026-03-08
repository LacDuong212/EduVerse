import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema({
  lectureId: { type: Schema.Types.ObjectId, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  wrongAnswers: [{ question: String, topic: String }]
}, { _id: false });

const quizProgressSchema = new mongoose.Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    quizzes: [quizResultSchema]
}, { timestamps: true });

quizProgressSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.models.QuizProgress || mongoose.model("QuizProgress", quizProgressSchema);