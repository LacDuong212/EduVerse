import AppError from "#exceptions/app.error.js";
import { bulkRemoveFromCart } from "#modules/cart/cart.service.js";
import { enrollsCourses } from "#modules/enrollment/enrollment.service.js";
import Order, { PAYMENT_METHOD_ENUM, STATUS_ENUM } from "#modules/order/order.model.js";
import { withTransaction } from "#utils/transaction.js";
import * as momoProvider from "./providers/momo.provider.js";
import * as vnpayProvider from "./providers/vnpay.provider.js";
import Transaction from "./transaction.model.js";
import * as cartService from "#modules/cart/cart.service.js";

export const createPayment = async ({ orderId, userId, paymentMethod, ipAddr }) => {
  const order = await Order.findOne({ _id: orderId, user: userId });

  if (!order) throw new AppError("Order not found.", 404);
  if (order.status !== STATUS_ENUM.pending)
    throw new AppError("Order is not pending.", 400);
  if (order.expiresAt && order.expiresAt < new Date())
    throw new AppError("Order expired.", 400);

  const orderInfo = `Payment for EduVerse Order ${orderId}`;

  const providers = {
    [PAYMENT_METHOD_ENUM.momo]: () =>
      momoProvider.createPayment(orderId, order.totalAmount, orderInfo),
    [PAYMENT_METHOD_ENUM.vnpay]: () =>
      vnpayProvider.createPayment(ipAddr, order.totalAmount, orderId, orderInfo),
  };

  if (!providers[paymentMethod]) throw new AppError("Payment method not supported.", 400);
  return providers[paymentMethod]();
};

export const processSuccessfulPayment = async ({
  orderId, amount, gateway, transactionId, rawData
}) => {
  return await withTransaction(async (session) => {
    const existingTx = await Transaction.findOne({ transactionId }).session(session);
    if (existingTx) return;

    const order = await Order.findById(orderId).session(session);
    if (!order) throw new AppError("Order not found", 404);
    if (order.totalAmount !== amount) throw new AppError("Amount mismatch", 400);

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

      const courseIds = order.courses.map(item => item?.course?.toString());

      await enrollsCourses(order.user, courseIds, session);

      await bulkRemoveFromCart(order.user, courseIds, session);
    }
  });
};

export const processFailedPayment = async ({ orderId, gateway, transactionId, rawData }) => {
  return await withTransaction(async (session) => {
    const existingTx = await Transaction.findOne({ transactionId }).session(session);
    if (existingTx) return;

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
  });
};