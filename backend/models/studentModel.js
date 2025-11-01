import mongoose from "mongoose";

const statsSubSchema = new mongoose.Schema({
  totalCourses: { type: Number, default: 0 },
  completedCourses: { type: Number, default: 0 },
  totalLessons: { type: Number, default: 0 },
  completedLessons: { type: Number, default: 0 },
});

const myCoursesSubSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
});

const studentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stats: statsSubSchema,

  myCourses: [myCoursesSubSchema],

  address: { type: String, default: "" },
}, {
  timestamps: true
});

export default mongoose.model("Student", studentSchema);