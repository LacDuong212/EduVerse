import { Router } from "express";
import { protect } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js";
import * as couponController from "./coupon.controller.js";
import * as couponSchema from "./coupon.validation.js";

const router = Router();

router.get("/", couponController.getAllCoupons);

router.post(
  "/apply",
  protect,
  validate(couponSchema.applyCouponSchema),
  couponController.applyCoupon
);

export default router;