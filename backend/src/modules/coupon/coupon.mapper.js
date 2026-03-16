export const toCouponDto = (coupon) => {
    if (!coupon) return null;

    return {
        couponId: coupon._id?.toString(),
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        startDate: coupon.startDate,
        expiryDate: coupon.expiryDate,
        isActive: coupon.isActive
    }
}

export const toCouponDtoList = (coupons) => {
    if (!Array.isArray(coupons)) return [];
    return coupons.map(toCouponDto);
}