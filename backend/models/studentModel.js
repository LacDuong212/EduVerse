import mongoose from "mongoose";

const statsSubSchema = new mongoose.Schema({
  totalCourses: { type: Number, default: 0 },
  completedCourses: { type: Number, default: 0 },
  totalLessons: { type: Number, default: 0 },
  completedLessons: { type: Number, default: 0 },
}, { _id: false });

const myCoursesSubSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
}, { _id: false });

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    stats: {
      type: statsSubSchema,
      default: () => ({}),
    },

    myCourses: {
      type: [myCoursesSubSchema],
      default: [],
    },

    address: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

// Optional: index cho truy vấn nhanh theo user
studentSchema.index({ user: 1 });

export default mongoose.model("Student", studentSchema);
