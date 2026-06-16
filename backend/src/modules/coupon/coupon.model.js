import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },

  discountType: {
    type: String,
    enum: ['percent', 'money'],
    required: true
  },

  discountValue: {
    type: Number,
    required: true,
    min: 1
  },

  description: { type: String, required: true, },
  startDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },

  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },

  refundees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  usersUsed: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, {
  timestamps: true
});

export default mongoose.model("Coupon", couponSchema);