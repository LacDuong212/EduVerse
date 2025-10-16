import mongoose from "mongoose";

const userInteractionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    interactionType: {
        type: String,
        enum: ['view', 'favorite', 'purchase'],
        required: true
    },
    interactedAt: {
        type: Date,
        default: Date.now
    },
}, {
    timestamps: true
});

// Index để tối ưu truy vấn
userInteractionSchema.index({ userId: 1, productId: 1, interactionType: 1 });
userInteractionSchema.index({ userId: 1, interactionType: 1, interactedAt: -1 });
userInteractionSchema.index({ productId: 1, interactionType: 1 });

// Compound index để tránh duplicate
userInteractionSchema.index({ userId: 1, productId: 1, interactionType: 1 }, { unique: true });

export default mongoose.model('UserInteraction', userInteractionSchema);