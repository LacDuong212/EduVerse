import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Enum from "#utils/enum.js";

export const ROLE_ENUM = new Enum({
  student: "student",
  instructor: "instructor"
});

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
  role: { type: String, enum: ROLE_ENUM.values(), default: ROLE_ENUM.student },
  googleId: { type: String, unique: true, sparse: true }
}, { timestamps: true });

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.setOtp = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.verifyOtp = otp;
  this.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000;
  return otp;
};

export default mongoose.model("User", userSchema) || mongoose.models.user;