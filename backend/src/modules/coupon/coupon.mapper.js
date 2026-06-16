
export const toCouponDto = (coupon) => {
  if (!coupon) return null;

  return {
    couponId: coupon._id?.toString(),
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    description: coupon.description || null,
    startDate: coupon.startDate,
    expiryDate: coupon.expiryDate,
    isActive: coupon.isActive,
    courseId: coupon.courseId?.toString?.() || null
  }
};

export const toCouponDtoList = (coupons) => {
  if (!Array.isArray(coupons)) return [];
  return coupons.map(toCouponDto);
};