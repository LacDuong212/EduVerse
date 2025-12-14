import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import Coupon from "../models/couponModel.js";
import Course from "../models/courseModel.js";


// GET /orders/
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate('courses.course')
      .populate('coupon')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching orders", error });
  }
};

// GET /orders/:id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('courses.course')
      .populate('coupon');

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // check ownership
   if (order.user.toString() !== req.userId.toString()) {
  return res.status(403).json({ success: false, message: "Unauthorized access" });
}


    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching order", error });
  }
};

// POST /orders/create
export const createOrder = async (req, res) => {
  let { cart, paymentMethod, couponCode } = req.body;

  if (!cart || !Array.isArray(cart.courses) || cart.courses.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty or invalid" });
  }

  if (!paymentMethod) {
    return res.status(400).json({ success: false, message: 'Payment method is required' });
  }

  const validMethods = ['momo', 'vnpay', 'free'];
  if (!validMethods.includes(paymentMethod)) {
    return res.status(400).json({ success: false, message: 'Invalid payment method' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.userId;

    const courseIds = cart.courses.map(c => c.courseId || c._id);

    const dbCourses = await Course.find({ _id: { $in: courseIds } }).session(session);

    const coursesToOrder = dbCourses.map(course => {
      const priceToUse = (course.discountPrice && course.discountPrice < course.price)
        ? course.discountPrice
        : course.price;
      return {
        course: course._id,
        pricePaid: priceToUse,
      };
    });

    const subTotal = coursesToOrder.reduce(
      (total, c) => total + c.pricePaid,
      0
    );

    let finalAmount = subTotal;
    let discountAmount = 0;
    let couponId = null;
    let couponDoc = null;

    if (couponCode) {
      couponDoc = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true
      }).session(session);

      if (!couponDoc) {
        throw new Error("Invalid or inactive coupon code");
      }
      if (new Date() > new Date(couponDoc.expiryDate)) {
        throw new Error("Coupon code has expired");
      }

      if (couponDoc.usersUsed.some(id => id.toString() === userId.toString())) {
        throw new Error("You have already used this coupon");
      }

      discountAmount = Math.round((subTotal * couponDoc.discountPercent) / 100);
      finalAmount = subTotal - discountAmount;
      if (finalAmount < 0) finalAmount = 0;

      couponId = couponDoc._id;
    }

    let orderStatus = "pending";

    if (finalAmount === 0) {
      paymentMethod = "free";
      orderStatus = "completed";
    } else {
      const validMethods = ['momo', 'vnpay'];
      if (!paymentMethod || !validMethods.includes(paymentMethod)) {
        throw new Error('Please select a valid payment method (MoMo/VNPAY)');
      }
    }

    const order = new Order({
      user: userId,
      courses: coursesToOrder,
      subTotal: subTotal,
      coupon: couponId,
      discountAmount: discountAmount,
      totalAmount: finalAmount,
      paymentMethod: paymentMethod,
      status: orderStatus
    });

    await order.save({ session });

    if (couponDoc) {
      await Coupon.findByIdAndUpdate(
        couponId,
        { $addToSet: { usersUsed: userId } },
        { session }
      );
    }

    await Cart.findOneAndUpdate(
      { user: userId },
      {
        $pull: {
          courses: { course: { $in: cart.courses.map(c => c.courseId) } }
        }
      },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, message: "Order created", order });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    const message = error.message || "Error creating order";
    const statusCode = message.includes("coupon") ? 400 : 500;

    res.status(statusCode).json({ success: false, message: message, error: error.message });
  }
};

// PATCH /orders/:id/update
export const updateOrder = async (req, res) => {
  try {
    const status = req.body.status;
    const validStatuses = ["pending", "completed", "refunded", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    if (status === "cancelled") {
      if (order.status !== "pending") {
        return res.status(400).json({ success: false, message: "Processed orders cannot be canceled." });
      }
      order.status = "cancelled";
      await order.save();
      return res.status(200).json({ success: true, message: "Order canceled", order });
    }

    return res.status(403).json({ success: false, message: "You are not authorized to perform this action." });

  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating order", error });
  }
};
