import mongoose from "mongoose";

export const TYPE_ENUM = ["INFO", "APPROVED", "SUCCEEDED", "REJECTED", "FAILED" , "BLOCKED"];

const notificationSchema = new mongoose.Schema({
  user: { type: String, required: true }, 
  type: { type: String, enum: TYPE_ENUM, default: TYPE_ENUM[0] },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Notification", notificationSchema);