import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";
import * as couponService from "./coupon.service.js";
import * as couponMapper from "./coupon.mapper.js";

export const getAllCoupons = asyncHandler(async (req, res) => {
    const coupons = await couponService.getAllCoupons();

    return sendSuccessResponse(
        res,
        200,
        "Coupon fetched successfully",
        couponMapper.toCouponDtoList(coupons)
    )
});

export const applyCoupon = asyncHandler(async (req, res) => {

  const { code, originalPrice } = req.body;

  const result = await couponService.applyCoupon(
    code,
    originalPrice,
    req.user._id
  );

  return sendSuccessResponse(
    res,
    200,
    "Coupon applied successfully",
    result
  );
});

