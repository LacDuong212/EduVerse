import mongoose from "mongoose";
import Course from "./courseModel.js";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phonenumber: { type: String },
    bio: { type: String, default: "" },
    website: { type: String, default: "" },
    socials: {
        facebook: { type: String, default: "" },
        twitter: { type: String, default: "" },
        instagram: { type: String, default: "" },
        youtube: { type: String, default: "" },
    },
    pfpImg: { type: String, default: "" },
    password: { type: String, required: true },
    verifyOtp: { type: String, default: '' },
    verifyOtpExpireAt: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isActivated: { type: Boolean, default: false },
    role: { type: String, enum: ['student', 'instructor'], default: 'student' },
}, { timestamps: true });

userSchema.post("save", async function () {
  await Course.updateMany(
    { "instructor.ref": this._id },
    { 
      "instructor.name": this.name,
      "instructor.avatar": this.avatar 
    }
  );
});

const userModel = mongoose.models.user || mongoose.model('User', userSchema);

export default userModel;