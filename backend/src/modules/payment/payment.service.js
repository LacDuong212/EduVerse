import mongoose from "mongoose";
import Order from "#modules/order/order.model.js";
import Course from "#modules/course/course.model.js";
import Transaction from "./transaction.model.js";
import AppError from "#exceptions/app.error.js";
import * as momoProvider from "./providers/momo.provider.js";
import * as vnpayProvider from "./providers/vnpay.provider.js";

/**
 * Create payment URL
 */
export const createPayment = async ({
  orderId,
  userId,
  paymentMethod,
  ipAddr
}) => {

  if (!mongoose.Types.ObjectId.isValid(orderId))
    throw new AppError("Invalid order ID", 400);

  const order = await Order.findById(orderId);

  if (!order) throw new AppError("Order not found", 404);
  if (order.user.toString() !== userId.toString())
    throw new AppError("Access denied", 403);
  if (order.status !== "pending")
    throw new AppError(`Order is already ${order.status}`, 400);
  if (order.expiresAt && order.expiresAt < new Date())
    throw new AppError("Order has expired", 400);

  const amount = order.totalAmount;
  const orderInfo = `Payment for order ${orderId}`;

  if (paymentMethod === "momo")
    return momoProvider.createPayment(orderId, amount, orderInfo);

  if (paymentMethod === "vnpay")
    return vnpayProvider.createPayment(ipAddr, amount, orderId, orderInfo);

  throw new AppError("Payment method not supported", 400);
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

    if (order.status === "pending") {
      order.status = "completed";
      order.expiresAt = null;
      await order.save({ session });

      await activateCourses(order, session);
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

    if (order.status === "pending") {
      order.status = "cancelled";
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


/**
 * Internal helper (not exported)
 */
const activateCourses = async (order, session) => {

  const counts = order.courses.reduce((m, c) => {
    const id = c.course.toString();
    m[id] = (m[id] || 0) + 1;
    return m;
  }, {});

  const bulkOps = Object.entries(counts).map(([id, cnt]) => ({
    updateOne: {
      filter: { _id: new mongoose.Types.ObjectId(id) },
      update: { $inc: { studentsEnrolled: cnt } }
    }
  }));

  if (bulkOps.length)
    await Course.bulkWrite(bulkOps, { session });
};