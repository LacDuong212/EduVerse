import mongoose from "mongoose";
const { Schema } = mongoose;

const QuizResultSchema = new Schema({
  lectureId: { type: Schema.Types.ObjectId, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  
  wrongAnswers: [{
    question: String,
    topic: String
  }]
}, { _id: false });

const QuizProgressSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    quizzes: [QuizResultSchema]
}, { timestamps: true });

QuizProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
export default mongoose.models.QuizProgress || mongoose.model("QuizProgress", QuizProgressSchema);