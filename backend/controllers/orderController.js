import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";


// GET /orders/
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).populate('courses.course');
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching orders", error });
  }
};

// GET /orders/:id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('courses.course');
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // check ownership
    if (order.user.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching order", error });
  }
};

// POST /orders/create
export const createOrder = async (req, res) => {
  try {
    const userId = req.userId;

    const { cart, paymentMethod } = req.body;

    if (!cart || !Array.isArray(cart.courses) || cart.courses.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty or invalid" });
    }

    if (!paymentMethod) {
      return res
        .status(400)
        .json({ success: false, message: 'Payment method is required' });
    }
    if (!['momo', 'vnpay'].includes(paymentMethod)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid payment method' });
    }

    const coursesToOrder = cart.courses.map((c) => ({
      course: c.courseId,
      pricePaid: c.discountPrice ?? c.price,
    }));

    const totalAmount = coursesToOrder.reduce(
      (total, c) => total + c.pricePaid,
      0
    );

    // create order
    const order = new Order({
      user: userId,
      courses: coursesToOrder,
      totalAmount: totalAmount,
      paymentMethod: paymentMethod,
      status: "pending"
    });

    await order.save();

    // update cart
    await Cart.findOneAndUpdate(
      { user: userId },
      {
        $pull: {
          courses: { course: { $in: cart.courses.map(c => c.courseId) } }
        }
      },
      { new: true }
    );

    res.status(201).json({ success: true, message: "Order created", order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating order", error });
  }
};

// PATCH /orders/:id/update
export const updateOrder = async (req, res) => {
  try {
    const status = req.body.status;
    const validStatuses = ["pending", "completed", "refunded"];
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

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, message: "Order updated", order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating order", error });
  }
};
