import mongoose from "mongoose";
import AppError from "#exceptions/app.error.js";
import { bulkRemoveFromCart, getCart } from "#modules/cart/cart.service.js";
import { updateUsedCoupon, validateCoupon } from "#modules/coupon/coupon.service.js";
import { enrollsCourses } from "#modules/enrollment/enrollment.service.js";
import Order, { STATUS_ENUM } from "#modules/order/order.model.js";

/**
 * Get all orders of a user
 */
export const getUserOrders = async (userId) => {
  return Order.find({ user: userId })
    .populate("courses.course")
    .populate("coupon")
    .sort({ createdAt: -1 });
};

/**
 * Get single order by ID
 */
export const getOrderById = async (orderId, userId) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  }).populate("courses.course")
    .populate("coupon");

  if (!order) throw new AppError("Order not found.", 404);
  return order;
};

/**
 * Create new order
 */
export const createOrder = async (userId, body) => {
  const { selectedCourseIds, paymentMethod, couponCode } = body;

  if (!selectedCourseIds || !selectedCourseIds.length)
    throw new AppError("No courses selected.", 400);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await getCart(userId, session);

    if (!cart || !cart.length)
      throw new AppError("There are no items in your cart to buy.", 400);

    const selectedItems = cart.filter(item =>
      selectedCourseIds.includes(item?.courseId)
    );

    if (!selectedItems.length)
      throw new AppError("Selected courses are not found in cart.", 409);

    let couponDoc = null;
    if (couponCode) {
      couponDoc = await validateCoupon(couponCode, userId, session);
    }

    const {
      items, subTotal, discountAmount, totalAmount
    } = calculateOrderTotals(selectedItems, couponDoc);

    let orderStatus = STATUS_ENUM.pending;
    let finalPaymentMethod = paymentMethod;

    if (finalAmount === 0) {
      orderStatus = STATUS_ENUM.completed;
      finalPaymentMethod = "free";
    }

    const [order] = await Order.create([{
      user: userId,
      courses: items,
      subTotal,
      coupon: couponDoc?._id,
      discountAmount,
      totalAmount,
      paymentMethod: finalPaymentMethod,
      status: orderStatus
    }], { session });

    if (orderStatus === STATUS_ENUM.completed) {
      await enrollsCourses(userId, selectedCourseIds, session);
    }

    if (couponDoc) await updateUsedCoupon(couponDoc._id, userId, session);
    await bulkRemoveFromCart(userId, selectedCourseIds, session);

    await session.commitTransaction();
    return order;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const calculateOrderTotals = (selectedItems, couponDoc) => {
  const items = selectedItems.map(course => {
    const priceToUse = course?.enableDiscount
      ? (course?.discountPrice ?? course?.price)
      : course?.price;

    return {
      course: course?.courseId,
      pricePaid: priceToUse
    };
  });

  const subTotal = items.reduce((sum, i) => sum + i.pricePaid, 0);
  let discountAmount = 0;

  if (couponDoc) {
    discountAmount = Math.round((subTotal * couponDoc.discountPercent) / 100);
  }

  const totalAmount = Math.max(subTotal - discountAmount, 0);

  return { items, subTotal, discountAmount, totalAmount };
};

/**
 * Cancel pending order
 */
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

export default {
  getUserOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  countCompletedOrdersByCourseIds,
  getOrderStatusByUserIdAndCourseId,
};