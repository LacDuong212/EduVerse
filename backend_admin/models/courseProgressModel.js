import mongoose from "mongoose";

// Minimal mirror of the main backend's CourseProgress — only the fields the
// admin certificate list needs. Same model name/collection so refs resolve.
const courseProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    isCompleted: { type: Boolean, default: false },
    certId: { type: String, unique: true, sparse: true },
    certIssuedAt: Date,
  },
  { timestamps: true, strict: false }
);

export default mongoose.model("CourseProgress", courseProgressSchema);
