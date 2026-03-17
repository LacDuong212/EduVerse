import { Router } from "express";
import authMiddleware from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js";
import * as paymentController from "./payment.controller.js";
import * as paymentSchema from "./payment.validation.js";

const paymentRoute = Router();

paymentRoute.post(
  "/",
  authMiddleware.protect,
  authMiddleware.restrictTo("student"),
  validate(paymentSchema.createPaymentSchema),
  paymentController.createPayment
);

paymentRoute.post("/momo/ipn", paymentController.momoIpn);
paymentRoute.get("/vnpay/ipn", paymentController.vnpayIpn);

export default paymentRoute;