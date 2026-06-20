import mongoose from "mongoose";

const userBadgeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge",
      required: true,
    },
    earnedAt: { type: Date, default: Date.now },
    triggerEvent: { type: String },
    triggerValue: { type: Number },
  },
  { timestamps: false }
);

// DB-level duplicate prevention — insertMany with ordered:false will silently
// ignore duplicate key errors, so double-award is impossible even under race conditions.
userBadgeSchema.index({ user: 1, badge: 1 }, { unique: true });
userBadgeSchema.index({ user: 1 });

export default mongoose.model("UserBadge", userBadgeSchema, "user_badges");
