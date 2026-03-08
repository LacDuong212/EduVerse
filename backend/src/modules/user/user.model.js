import mongoose from "mongoose";

export const ROLE_ENUM = ["student", "instructor"];

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phonenumber: { type: String },
  bio: { type: String, default: '' },
  website: { type: String, default: '' },
  socials: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    youtube: { type: String, default: '' },
  },
  pfpImg: { type: String, default: '' },
  password: { type: String, required: false, select: false },
  verifyOtp: { type: String, default: '' },
  verifyOtpExpireAt: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isActivated: { type: Boolean, default: true },
  interests: [{ type: String }],
  role: { type: String, enum: ROLE_ENUM, default: ROLE_ENUM[0] },
  googleId: { type: String, unique: true, sparse: true }
}, { timestamps: true });

export default mongoose.model("User", userSchema) || mongoose.models.user;