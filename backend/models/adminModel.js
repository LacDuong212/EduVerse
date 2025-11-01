import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verifyOtp: { type: String, default: '' },
    verifyOtpExpireAt: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false }
}, { timestamps: true });

const adminModel = mongoose.models.admin || mongoose.model('Admin', adminSchema);

export default adminModel;