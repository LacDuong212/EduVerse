import Coupon from "./coupon.model.js";

export const validateCoupon = async (
  couponCode, userId, session = null
) => {
  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    usersUsed: { $ne: userId },
    isActive: true,
  }).session(session)
    .lean();

  if (!coupon)
    throw new AppError("Invalid coupon or coupon already used.", 400);

  if (coupon.expiryDate < new Date())
    throw new AppError("Coupon already expired.", 400);

  return coupon;
};

export const updateUsedCoupon = async (
  couponId, userId, session = null
) => {
  return await Coupon.findByIdAndUpdate(
    couponId,
    { $addToSet: { usersUsed: userId } },
    { session }
  ).lean();
};

export default {
  validateCoupon,
  updateUsedCoupon,
};