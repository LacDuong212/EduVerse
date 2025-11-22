import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

wishlistSchema.index({ userId: 1 });
wishlistSchema.index({ courseId: 1 });

wishlistSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model("Wishlist", wishlistSchema);