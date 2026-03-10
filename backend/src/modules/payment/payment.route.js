import { Router } from "express";
import * as paymentController from "./payment.controller.js";
import authMiddleware from "#middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/",
  authMiddleware.protect,
  authMiddleware.restrictTo("student"),
  paymentController.createPayment
);

router.post("/momo/ipn", paymentController.momoIpn);
router.get("/vnpay/ipn", paymentController.vnpayIpn);

export default router;