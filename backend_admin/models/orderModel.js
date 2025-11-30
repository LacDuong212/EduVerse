import mongoose from "mongoose";


const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courses: [
    {
      course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
      pricePaid: { type: Number, required: true },  // freeze course price
    },
  ],
  totalAmount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ['momo', 'vnpay'],
    required: [true, 'Payment method is required'],
  },
  status: {
    type: String,
    enum: ["pending", "completed", "refunded", "cancelled"],
    default: "pending",
  },
  expiresAt: { type: Date },  // for pending orders, 1h expiry
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);