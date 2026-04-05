import mongoose from "mongoose";
import Enum from "#utils/enum.js";

export const TYPE_ENUM = new Enum({
  info: "info",
  approved: "approved",
  succeeded: "succeeded",
  rejected: "rejected",
  failed: "failed" ,
  blocked: "blocked"
});

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: TYPE_ENUM.values(), default: TYPE_ENUM.info },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1 });

export default mongoose.model("Notification", notificationSchema);