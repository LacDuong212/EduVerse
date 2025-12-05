import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courses: [
    {
      course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
      pricePaid: { type: Number, required: true },
    },
  ],

  subTotal: { type: Number, required: true },
  
  coupon: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Coupon",
    default: null
  },
  
  discountAmount: { type: Number, default: 0 },

  totalAmount: { type: Number, required: true },

  paymentMethod: {
    type: String,
    enum: ['momo', 'vnpay', 'free'],
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "completed", "refunded", "cancelled"],
    default: "pending",
  },

  expiresAt: { 
    type: Date, 
    default: () => Date.now() + 1*60*60*1000 
  },
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);