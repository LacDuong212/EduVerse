import mongoose from "mongoose";

// account details
const statsSubSchema = new mongoose.Schema({
  totalCourses: { type: Number, default: 0 },
  totalStudents: { type: Number, default: 0 },
});
const myCoursesSubSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
});
const myStudentsSubSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  addedAt: { type: Date, default: Date.now },
});
const enrollmentSubSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isActive: { type: Boolean, default: true },
  enrolledAt: { type: Date, default: Date.now },
});
const ratingSubSchema = new mongoose.Schema({
  averageRating: { type: Number, min: 0, max: 5, default: 0 },
  totalRatings: { type: Number, default: 0 },
});
const linkedAccountSubSchema = new mongoose.Schema({
  platform: { type: String },
  profileUrl: { type: String },
  addedAt: { type: Date, default: Date.now },
});

// profile details
const skillSubSchema = new mongoose.Schema({
  skill: { type: String },
  skillRating: { type: Number, min: 0, max: 5, default: 0 },
});
const educationSubSchema = new mongoose.Schema({
  institution: { type: String },
  degree: { type: String },
  fieldOfStudy: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  addedAt: { type: Date, default: Date.now },
});

const instructorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stats: statsSubSchema,
  rating: ratingSubSchema,
  linkedAccounts: [linkedAccountSubSchema],

  myCourses: [myCoursesSubSchema],
  myStudents: [myStudentsSubSchema],
  enrollments: [enrollmentSubSchema],

  introduction: { type: String, default: "" },
  address: { type: String, default: "" },
  
  occupation: { type: String, default: "" },
  skills: [skillSubSchema],
  education: [educationSubSchema],
}, {
  timestamps: true    // = adding createdAt & updatedAt (automatically handled by mongoose)
});

export default mongoose.model("Instructor", instructorSchema);
