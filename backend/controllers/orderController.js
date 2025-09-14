import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import { registerTask } from "../utils/scheduler.js";


// service
// run every minute
registerTask("Expire Orders", "* * * * *", async () => {
  const now = new Date();

  const result = await Order.updateMany(
    { status: "pending", expiresAt: { $lte: now } },
    { $set: { status: "cancelled" } }
  );

  if (result.modifiedCount > 0) {
    console.log(`> Cancelled ${result.modifiedCount} orders`);
  }
});

// transform
const transformCourses = (courses) => {
  return courses.map(({ course, pricePaid }) => ({
    courseId: course._id,
    title: course.title,
    subtitle: course.subtitle,
    category: course.category,
    level: course.level,
    thumbnail: course.thumbnail,
    pricePaid,
  }));
};

// GET /
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).populate('courses.course');

    // TODO: transform orders (differ for admin)

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching orders", error });
  }
};

// GET /:id
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('courses.course');
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // check ownership, #TODO: admin (& transforming order)
    if (order.user.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching order", error });
  }
};

// POST /create
export const createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const cart = await Cart.findOne({ user: userId }).populate('courses.course');
    if (!cart || cart.courses.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // create order
    const order = new Order({
      user: userId,
      courses: cart.courses.map(c => ({
        course: c.course._id,
        pricePaid: c.course.price,
      })),
      totalAmount: cart.courses.reduce((total, c) => total + c.course.price, 0),
      status: "pending",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    await order.save();
    await Cart.findOneAndDelete({ user: userId });  // clear cart after

    res.status(201).json({ success: true, message: "Order created", order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating order", error });
  }
};

// PATCH /:id/update
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

    if (order.user.toString() !== req.userId) {   // TODO: admin
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, message: "Order updated", order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating order", error });
  }
};
