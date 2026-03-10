import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  gateway: {
    type: String,
    enum: ["momo", "vnpay"],
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["success", "failed"],
    required: true
  },
  rawResponse: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);