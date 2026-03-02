import mongoose from "mongoose";

// account details
const statsSubSchema = new mongoose.Schema({
  totalCourses: { type: Number, default: 0 },
  totalStudents: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  averageRating: { type: Number, min: 0, max: 5, default: 0 },
});
const myCoursesSubSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
});
const myStudentsSubSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  addedAt: { type: Date, default: Date.now },
});

// profile details
const skillSubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: Number, min: 0, max: 100, required: true, default: 0 },
});
const educationSubSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, default: '' },
  fieldOfStudy: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  addedAt: { type: Date, default: Date.now },
});

const instructorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stats: statsSubSchema,

  myCourses: [myCoursesSubSchema],
  myStudents: [myStudentsSubSchema],

  introduction: { type: String, default: '' },
  address: { type: String, default: '' },
  
  occupation: { type: String, default: '' },
  skills: [skillSubSchema],
  education: [educationSubSchema],

  isApproved: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model("Instructor", instructorSchema);