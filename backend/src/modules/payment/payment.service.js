import mongoose from "mongoose";
import AppError from "#exceptions/app.error.js";
import { enrollsCourses } from "#modules/enrollment/enrollment.service.js";
import Order, { PAYMENT_METHOD_ENUM, STATUS_ENUM } from "#modules/order/order.model.js";
import * as momoProvider from "./providers/momo.provider.js";
import * as vnpayProvider from "./providers/vnpay.provider.js";
import Transaction from "./transaction.model.js";

/**
 * Create payment URL
 */
export const createPayment = async ({
  orderId,
  userId,
  paymentMethod,
  ipAddr
}) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  if (!order) throw new AppError("Order not found.", 404);
  if (order.status !== STATUS_ENUM.pending)
    throw new AppError(`Order is already ${order.status?.toUpperCase()}.`, 400);
  if (order.expiresAt && order.expiresAt < new Date())
    throw new AppError("Order has expired.", 400);

  const amount = order.totalAmount;
  const orderInfo = `Payment for order ${orderId}`;

  if (paymentMethod === PAYMENT_METHOD_ENUM.momo)
    return momoProvider.createPayment(orderId, amount, orderInfo);
  else if (paymentMethod === PAYMENT_METHOD_ENUM.vnpay)
    return vnpayProvider.createPayment(ipAddr, amount, orderId, orderInfo);
  else
    throw new AppError("Payment method not supported.", 400);
};

/**
 * Handle successful payment (IPN)
 */
export const processSuccessfulPayment = async ({
  orderId,
  amount,
  gateway,
  transactionId,
  rawData
}) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Idempotency check
    const existingTx = await Transaction
      .findOne({ transactionId })
      .session(session);

    if (existingTx) {
      await session.abortTransaction();
      session.endSession();
      return;
    }

    const order = await Order.findById(orderId).session(session);

    if (!order) throw new AppError("Order not found", 404);
    if (order.totalAmount !== amount)
      throw new AppError("Invalid amount", 400);

    // Save transaction
    await Transaction.create([{
      orderId: order._id,
      userId: order.user,
      gateway,
      transactionId,
      amount,
      status: "success",
      rawResponse: rawData
    }], { session });

    if (order.status === STATUS_ENUM.pending) {
      order.status = STATUS_ENUM.completed;
      order.expiresAt = null;
      await order.save({ session });

      await enrollsCourses(order.user, order.courses.map(item => item.course), session);
    }

    await session.commitTransaction();
    session.endSession();

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/**
 * Handle failed payment
 */
export const processFailedPayment = async ({
  orderId,
  gateway,
  transactionId,
  rawData
}) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingTx = await Transaction
      .findOne({ transactionId })
      .session(session);

    if (existingTx) {
      await session.abortTransaction();
      session.endSession();
      return;
    }

    const order = await Order.findById(orderId).session(session);
    if (!order) throw new AppError("Order not found", 404);

    await Transaction.create([{
      orderId: order._id,
      userId: order.user,
      gateway,
      transactionId,
      amount: order.totalAmount,
      status: "failed",
      rawResponse: rawData
    }], { session });

    if (order.status === STATUS_ENUM.pending) {
      order.status = STATUS_ENUM.cancelled;
      order.expiresAt = null;
      await order.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

export default {
  createPayment,
  processSuccessfulPayment,
  processFailedPayment,
};