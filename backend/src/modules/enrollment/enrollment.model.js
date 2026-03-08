import mongoose from "mongoose";

export const STATUS_ENUM = ["active", "completed", "refunded"];

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
    enum: STATUS_ENUM,
    default: STATUS_ENUM[0]
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