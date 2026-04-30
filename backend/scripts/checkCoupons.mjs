import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
const Coupon = mongoose.model("Coupon", new mongoose.Schema({}, { strict: false }));
const STUDENT_ID = "694d32d7ebe694fc49e59a67";

const couponsUsed = await Coupon.find({
  usersUsed: new mongoose.Types.ObjectId(STUDENT_ID)
}).lean();
console.log("Coupons where student in usersUsed:", couponsUsed.map(c => ({ code: c.code, isActive: c.isActive, expiryDate: c.expiryDate })));

const all = await Coupon.find().lean();
console.log("All coupons:", all.map(c => ({
  code: c.code,
  isActive: c.isActive,
  startDate: c.startDate,
  expiryDate: c.expiryDate,
  usedCount: c.usersUsed?.length ?? 0
})));

await mongoose.disconnect();
