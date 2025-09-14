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
  status: {
    type: String,
    enum: ["pending", "completed", "refunded", "cancelled"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },  // for pending orders, 1h expiry
});

export default mongoose.model("Order", orderSchema);