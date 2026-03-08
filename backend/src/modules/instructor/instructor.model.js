import mongoose from "mongoose";

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
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
  stats: {
    totalCourses: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    ratingSum: { type: Number, default: 0 },
  },

  myCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],

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