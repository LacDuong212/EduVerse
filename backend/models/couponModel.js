import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },

  description: {
    type: String,
    required: true, 
  },
  
  discountPercent: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },

  startDate: {
    type: Date,
    required: true
  },

  expiryDate: {
    type: Date,
    required: true
  },

  isActive: {
    type: Boolean,
    default: true
  },

  usersUsed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
}, {
  timestamps: true
});

export default mongoose.model("Coupon", couponSchema);