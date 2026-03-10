import asyncHandler from "#shared/utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";
import AppError from "#exceptions/app.error.js";
import paymentService from "./payment.service.js";
import * as momoProvider from "./providers/momo.provider.js";
import * as vnpayProvider from "./providers/vnpay.provider.js";

export const createPayment = asyncHandler(async (req, res, next) => {

  const { orderId, paymentMethod } = req.body;

  if (!orderId || !paymentMethod)
    return next(new AppError("Missing required fields", 400));

  const result = await paymentService.createPayment({
    orderId,
    userId: req.user._id,
    paymentMethod,
    ipAddr: req.ip
  });

  return sendSuccessResponse(
    res,
    200,
    "Payment URL created successfully",
    result
  );
});

export const momoIpn = asyncHandler(async (req, res) => {

  const { isValid, amount, resultCode } =
    momoProvider.verifySignature(req.body);

  if (!isValid)
    throw new AppError("Invalid signature", 400);

  const { orderId, transId } = req.body;

  if (resultCode === 0) {
    await paymentService.processSuccessfulPayment({
      orderId,
      amount,
      gateway: "momo",
      transactionId: transId,
      rawData: req.body
    });
  } else {
    await paymentService.processFailedPayment({
      orderId,
      gateway: "momo",
      transactionId: transId,
      rawData: req.body
    });
  }

  return res.status(204).send();
});

export const vnpayIpn = asyncHandler(async (req, res) => {

  const isValid = vnpayProvider.verifySignature(req.query);

  if (!isValid)
    return res.status(200).json({ RspCode: "97", Message: "Checksum failed" });

  const orderId = req.query["vnp_TxnRef"];
  const amount = Number(req.query["vnp_Amount"]) / 100;
  const rspCode = req.query["vnp_ResponseCode"];
  const transactionId = req.query["vnp_TransactionNo"];

  if (rspCode === "00") {
    await paymentService.processSuccessfulPayment({
      orderId,
      amount,
      gateway: "vnpay",
      transactionId,
      rawData: req.query
    });
  } else {
    await paymentService.processFailedPayment({
      orderId,
      gateway: "vnpay",
      transactionId,
      rawData: req.query
    });
  }

  return res.status(200).json({ RspCode: "00", Message: "Success" });
});