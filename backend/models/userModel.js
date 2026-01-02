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
    instagram: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    youtube: { type: String, default: "" },
  },
  pfpImg: { type: String, default: "" },
  password: { type: String, required: false },
  verifyOtp: { type: String, default: '' },
  verifyOtpExpireAt: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isActivated: { type: Boolean, default: true },
  interests: [{ type: String }],
  role: { type: String, enum: ['student', 'instructor'], default: 'student' },
  googleId: { type: String, unique: true, sparse: true }
}, { timestamps: true });

userSchema.post("findByIdAndUpdate", async function (doc) {
  console.log("erdtfygvhbujnk");
  if (!this.isModified("name") && !this.isModified("avatar")) return;

  try {
    await Course.updateMany(
      { "instructor.ref": doc._id },
      {
        $set: {
          "instructor.name": doc.name,
          "instructor.avatar": doc.pfpImg
        }
      }
    );
  } catch (err) {
    console.error("Failed to update instructor info in courses: ", err);
  }
});

const userModel = mongoose.models.user || mongoose.model('User', userSchema);

export default userModel;