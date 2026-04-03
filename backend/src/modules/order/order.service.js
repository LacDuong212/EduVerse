import AppError from "#exceptions/app.error.js";
import Order, { STATUS_ENUM } from "#modules/order/order.model.js";

export const getUserOrders = async (userId) => {
  return Order.find({ user: userId })
    .populate("courses.course")
    .populate("coupon")
    .sort({ createdAt: -1 });
};

export const getOrderById = async (orderId, userId) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  }).populate("courses.course")
    .populate("coupon");

  if (!order) throw new AppError("Order not found.", 404);
  return order;
};

export const cancelOrder = async (orderId, userId) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  if (!order) throw new AppError("Order not found.", 404);

  if (order.status !== STATUS_ENUM.pending)
    throw new AppError("Processed orders cannot be cancelled", 409);

  order.status = STATUS_ENUM.cancelled;
  await order.save();

  return order;
};

export const countCompletedOrdersByCourseIds = async (courseIds = []) => {
  if (!courseIds || courseIds.length === 0) return 0;

  const count = await Order.countDocuments({
    status: STATUS_ENUM.completed,
    "courses.course": { $in: courseIds }
  });

  return count;
};

export const getOrderStatusByUserIdAndCourseId = async (userId, courseId) => {
  if (!userId || !courseId) return null;

  const order = await Order.findOne({
    user: userId,
    "courses.course": courseId,
  }).lean();

  if (!order) return null;
  else return order.status || null;
};