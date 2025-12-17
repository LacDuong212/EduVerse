import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true }, 
  type: { type: String, enum: ['APPROVED', 'SUCCEEDED', 'REJECTED', 'FAILED' , 'INFO', 'BLOCKED'], default: 'INFO' },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Notification", notificationSchema);