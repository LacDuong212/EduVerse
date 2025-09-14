import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courses: [
    {
      course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      addedAt: { type: Date, default: Date.now },   // timestamp when added to cart
    },
  ],
});

export default mongoose.model("Cart", cartSchema);