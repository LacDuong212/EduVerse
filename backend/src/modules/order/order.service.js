import mongoose from "mongoose";
import Order from "#modules/order/order.model.js";
import Cart from "#modules/cart/cart.model.js";
import Coupon from "#modules/coupon/coupon.model.js";
import Course from "#modules/course/course.model.js";
import AppError from "#exceptions/app.error.js";

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
  const order = await Order.findById(orderId)
    .populate("courses.course")
    .populate("coupon");

  if (!order) throw new AppError("Order not found", 404);
  if (order.user.toString() !== userId.toString())
    throw new AppError("Unauthorized access", 403);

  return order;
};

/**
 * Create new order
 */
export const createOrder = async (userId, body) => {
  const { cart, paymentMethod, couponCode } = body;

  if (!cart?.courses?.length)
    throw new AppError("Cart is empty", 400);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const courseIds = cart.courses.map(c => c.courseId || c._id);

    const dbCourses = await Course.find({
      _id: { $in: courseIds }
    }).session(session);

    if (!dbCourses.length)
      throw new AppError("Courses not found", 400);

    const coursesToOrder = dbCourses.map(course => {
      const priceToUse =
        (course.discountPrice && course.discountPrice < course.price)
          ? course.discountPrice
          : course.price;

      return {
        course: course._id,
        pricePaid: priceToUse
      };
    });

    const subTotal = coursesToOrder.reduce(
      (total, c) => total + c.pricePaid,
      0
    );

    let discountAmount = 0;
    let finalAmount = subTotal;
    let couponDoc = null;

    if (couponCode) {
      couponDoc = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true
      }).session(session);

      if (!couponDoc)
        throw new AppError("Invalid coupon", 400);

      if (new Date() > couponDoc.expiryDate)
        throw new AppError("Coupon expired", 400);

      if (couponDoc.usersUsed.includes(userId))
        throw new AppError("Coupon already used", 400);

      discountAmount = Math.round(
        (subTotal * couponDoc.discountPercent) / 100
      );

      finalAmount = Math.max(subTotal - discountAmount, 0);
    }

    let orderStatus = "pending";
    let finalPaymentMethod = paymentMethod;

    if (finalAmount === 0) {
      orderStatus = "completed";
      finalPaymentMethod = "free";
    }

    const [order] = await Order.create([{
      user: userId,
      courses: coursesToOrder,
      subTotal,
      coupon: couponDoc?._id,
      discountAmount,
      totalAmount: finalAmount,
      paymentMethod: finalPaymentMethod,
      status: orderStatus
    }], { session });

    if (orderStatus === "completed") {
      await activateCourses(order, session);
    }

    if (couponDoc) {
      await Coupon.findByIdAndUpdate(
        couponDoc._id,
        { $addToSet: { usersUsed: userId } },
        { session }
      );
    }

    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { courses: [] } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return order;

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Cancel pending order
 */
export const cancelOrder = async (orderId, userId) => {
  const order = await Order.findById(orderId);

  if (!order) throw new AppError("Order not found", 404);
  if (order.user.toString() !== userId.toString())
    throw new AppError("Unauthorized", 403);

  if (order.status !== "pending")
    throw new AppError("Processed orders cannot be cancelled", 400);

  order.status = "cancelled";
  await order.save();

  return order;
};

/**
 * Internal helper: activate courses
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