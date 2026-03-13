import mongoose from "mongoose";
import Enum from "#utils/enum.js"

export const STATUS_ENUM = new Enum({
  active: "active",
  completed: "completed",
  refunded: "refunded",
  inactive: "inactive", // when course is deleted
});

const enrollmentSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    index: true
  },
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Course", 
    required: true 
  },
  instructor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Instructor", 
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: STATUS_ENUM.values(),
    default: STATUS_ENUM.active
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.model("Enrollment", enrollmentSchema);