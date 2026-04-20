import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";
import * as paymentService from "./payment.service.js";
import * as momoProvider from "./providers/momo.provider.js";
import * as vnpayProvider from "./providers/vnpay.provider.js";

const clientUrl = process.env.CLIENT_URL;

// @route POST /
export const createPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentMethod } = req.validated?.body || {};

  const rawIp =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  const ipAddr = rawIp === "::1" ? "127.0.0.1" : rawIp;

  const result = await paymentService.createPayment({
    orderId,
    userId: req.user?.userId,
    paymentMethod,
    ipAddr
  });

  return sendSuccessResponse(
    res,
    200,
    "Payment URL created successfully",
    result
  );
});

// @route POST /momo/ipn
export const momoIpn = asyncHandler(async (req, res) => {
  const { isValid, amount, resultCode } =
    momoProvider.verifySignature(req.body);

  if (!isValid) {
    return res.status(200).json({ message: "Invalid signature" });
  }

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

// @route GET /vnpay/ipn
export const vnpayIpn = asyncHandler(async (req, res) => {
  const isValid = vnpayProvider.verifySignature(req.query);

  if (!isValid)
    return res.status(200).json({ RspCode: "97", Message: "Checksum failed" });

  const orderId = req.query["vnp_TxnRef"];
  if (!orderId)
    return res.status(200).json({ RspCode: "01", Message: "Invalid request" });
  
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

// @route GET /momo/return
export const momoReturn = asyncHandler(async (req, res) => {
  const { isValid, amount, resultCode } = momoProvider.verifySignature(req.query);
  const { orderId, transId } = req.query;

  const success = isValid && Number(resultCode) === 0;

  if (orderId && transId) {
    if (success) {
      await paymentService.processSuccessfulPayment({
        orderId,
        amount,
        gateway: "momo",
        transactionId: transId,
        rawData: req.query
      });
    } else {
      await paymentService.processFailedPayment({
        orderId,
        gateway: "momo",
        transactionId: transId,
        rawData: req.query
      });
    }
  }

  const redirectUrl = success
    ? `${clientUrl}/student/payment-success?orderId=${orderId}&code=${resultCode}&gateway=momo`
    : `${clientUrl}/student/payment-failed?orderId=${orderId}&code=${resultCode}&gateway=momo`;

  return res.redirect(redirectUrl);
});

// @route GET /vnpay/return
export const vnpayReturn = asyncHandler(async (req, res) => {
  const isValid = vnpayProvider.verifySignature(req.query);

  const orderId = req.query["vnp_TxnRef"];
  const rspCode = req.query["vnp_ResponseCode"];
  const amount = Number(req.query["vnp_Amount"] || 0) / 100;
  const transactionId = req.query["vnp_TransactionNo"];

  const success = isValid && rspCode === "00";

  if (orderId && transactionId) {
    if (success) {
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
  }

  const redirectUrl = success
    ? `${clientUrl}/student/payment-success?orderId=${orderId}&code=${rspCode}&gateway=vnpay`
    : `${clientUrl}/student/payment-failed?orderId=${orderId}&code=${rspCode}&gateway=vnpay`;

  return res.redirect(redirectUrl);
});