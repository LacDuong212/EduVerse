import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";
import * as couponService from "./coupon.service.js";
import * as couponMapper from "./coupon.mapper.js";

// @route GET /
export const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await couponService.getAllCoupons();
  return sendSuccessResponse(
    res,
    200,
    "Coupon fetched successfully.",
    couponMapper.toCouponDtoList(coupons)
  )
});

// @route POST /apply
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code, originalPrice } = req.validated?.body || {};

  const result = await couponService.applyCoupon(
    code,
    originalPrice,
    req.user?.userId
  );

  return sendSuccessResponse(
    res,
    200,
    "Coupon applied successfully.",
    result
  );
});

// @route GET /refund/:courseId/status
export const getRefundCouponStatus = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const result = await couponService.getRefundCouponStatus(
    courseId,
    req.user?.userId
  );

  return sendSuccessResponse(
    res,
    200,
    "Refund coupon status fetched successfully.",
    result
  );
});

// @route POST /refund/:courseId/claim
export const claimRefundCoupon = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const result = await couponService.claimRefundCoupon(
    courseId,
    req.user?.userId
  );

  return sendSuccessResponse(
    res,
    200,
    result.message,
    result
  );
});