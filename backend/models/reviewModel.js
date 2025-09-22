import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    description: { type: String, trim: true, maxLength: 1000 },
    isDeleted: { type: Boolean, default: false }    // for soft delete
  },
  { timestamps: true }    // = adding createdAt & updatedAt
);
//reviewSchema.index({ course: 1, user: 1 }, { unique: true }); // if only 1 review/user/course

export default mongoose.model("Review", reviewSchema);