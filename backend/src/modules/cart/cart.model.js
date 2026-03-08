import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  courses: [
    new mongoose.Schema({
      course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
      addedAt: { type: Date, default: Date.now },
    }, { _id: false })
  ],
}, { timestamps: true });

export default mongoose.model("Cart", cartSchema);