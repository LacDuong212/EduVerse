import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  addedAt: { type: Date, default: Date.now }
}, { timestamps: true });

wishlistSchema.index({ user: 1 });
wishlistSchema.index({ course: 1 });
wishlistSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model("Wishlist", wishlistSchema);