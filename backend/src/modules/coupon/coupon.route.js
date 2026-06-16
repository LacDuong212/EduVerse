import { Router } from "express";
import { protect } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js";
import * as couponController from "./coupon.controller.js";
import * as couponSchema from "./coupon.validation.js";

// @route /coupons
const router = Router();

router.get("/", couponController.getAllCoupons);

router.post(
  "/apply",
  protect,
  validate(couponSchema.applyCouponRequest),
  couponController.applyCoupon
);

router.get(
  "/refund/:courseId/status",
  protect,
  couponController.getRefundCouponStatus
);

router.post(
  "/refund/:courseId/claim",
  protect,
  couponController.claimRefundCoupon
);

export default router;