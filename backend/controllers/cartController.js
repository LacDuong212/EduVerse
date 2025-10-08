import Cart from "../models/cartModel.js";
import Course from "../models/courseModel.js";
import Order from "../models/orderModel.js";

// #TODO: limit cart items
// service
const transformCourses = (courses) => {
  return courses.map(({ course, addedAt }) => ({
    courseId: course._id,
    title: course.title,
    subtitle: course.subtitle,
    category: course.category,
    level: course.level,
    thumbnail: course.thumbnail,
    price: course.price,
    discountPrice: course.discountPrice,
    addedAt,
  }));
};

// GET /cart/
export const getCart = async (req, res) => {
  try {
    const userId = req.userId;

    // get or create cart
    let cart = await Cart.findOne({ user: userId }).populate('courses.course');
    if (!cart) {
      cart = await Cart.create({ user: userId, courses: [] });
    }

    // transform/flatten
    const items = transformCourses(cart.courses);

    res.status(200).json({ success: true, cart: items });
  }
  catch (error) {
    res.status(500).json({ success: false, message: "Error fetching cart", error });
  }
};

// POST /cart/add
export const addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { courseId } = req.body;

    // get or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, courses: [] });
    }

    // check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // check if course already in cart
    const courseExists = cart.courses.some(c => c.course.toString() === courseId);
    if (courseExists) {
      return res.status(200).json({ success: false, message: "Course already in cart" });
    }

    // check if course already owned
    const completedOrder = await Order.findOne({
      user: userId,
      "courses.course": courseId,
      status: "completed",
    });
    if (completedOrder) {
      return res.status(200).json({ success: false, message: "You already own this course" });
    }

    // check if course in a pending order
    const pendingOrder = await Order.findOne({
      user: userId,
      "courses.course": courseId,
      status: "pending",
      expiresAt: { $gt: new Date() },
    });
    if (pendingOrder) {
      return res.status(200).json({ success: false, message: "This course is already in your active order" });
    }

    cart.courses.push({ course: courseId });
    await cart.save();

    // transform/flatten
    await cart.populate('courses.course');
    const items = transformCourses(cart.courses);

    res.status(200).json({ success: true, message: "Course added to cart", cart: items });
  }
  catch (error) {
    res.status(500).json({ success: false, message: "Error adding to cart", error });
  }
};

// DELETE /cart/remove
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { courseId } = req.body;

    // get cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    // check if course in cart
    cart.courses = cart.courses.filter(c => c.course.toString() !== courseId);
    await cart.save();

    // transform/flatten
    await cart.populate('courses.course');
    const items = transformCourses(cart.courses);
    
    res.status(200).json({ success: true, message: "Course removed from cart", cart: items });
  }
  catch (error) {
    res.status(500).json({ success: false, message: "Error removing from cart", error });
  }
};

// DELETE /cart/clear
export const clearCart = async (req, res) => {
  try {
    const userId = req.userId;

    // get cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    // clear cart
    cart.courses = [];
    await cart.save();

    res.status(200).json({ success: true, message: "Cart cleared", cart });
  }
  catch (error) {
    res.status(500).json({ success: false, message: "Error clearing cart", error });
  }
};
