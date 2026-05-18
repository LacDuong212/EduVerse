import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

  stats: {
    totalCourses: { type: Number, min: 0, default: 0 },
    completedCourses: { type: Number, min: 0, default: 0 },
    totalLectures: { type: Number, min: 0, default: 0 },
    completedLectures: { type: Number, min: 0, default: 0 },
  },

  interests: [{ type: String }],
}, { timestamps: true });

export default mongoose.model("Student", studentSchema);