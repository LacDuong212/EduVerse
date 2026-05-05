import mongoose from "mongoose";
import AppError from "#exceptions/app.error.js"
import Coupon from "./coupon.model.js";

export const getAllCoupons = async () => {
  return Coupon.find()
    .sort({ createdAt: -1 })
    .lean();
};

export const applyCoupon = async (couponCode, originalPrice, userId) => {
  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    isActive: true,
    usersUsed: { $ne: new mongoose.Types.ObjectId(userId) }
  }).lean();

  if (!coupon) {
    const exists = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!exists) throw new AppError("Invalid coupon code.", 404);

    if (exists.usersUsed.some(id => id.toString() === userId.toString()))
      throw new AppError("You already used this coupon.", 409);

    throw new AppError("Invalid coupon code.", 404);
  }

  const now = new Date();
  if (now < new Date(coupon.startDate))
    throw new AppError("This coupon is not active yet.", 400);

  if (now > new Date(coupon.expiryDate))
    throw new AppError("Coupon already expired.", 400);

  const discountAmount = (originalPrice * coupon.discountPercent) / 100;
  const finalPrice = Math.max(originalPrice - discountAmount, 0);

  return {
    couponCode: coupon.code,
    discountPercent: coupon.discountPercent,
    discountAmount,
    newPrice: finalPrice
  };
};

export const validateCoupon = async (couponCode, userId, session = null) => {
  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    usersUsed: { $ne: userId },
    isActive: true,
  }).session(session)
    .lean();

  if (!coupon)
    throw new AppError("Invalid coupon or coupon already used.", 400);

  const now = new Date();
  if (now < new Date(coupon.startDate))
    throw new AppError("This coupon is not active yet.", 400);

  if (now > new Date(coupon.expiryDate))
    throw new AppError("Coupon already expired.", 400);

  return coupon;
};

export const updateUsedCoupon = async (couponId, userId, session = null) => {
  return await Coupon.findByIdAndUpdate(
    couponId,
    { $addToSet: { usersUsed: userId } },
    { session }
  ).lean();
};