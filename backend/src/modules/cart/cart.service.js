import AppError from "#exceptions/app.error.js";
import { getOrderStatusByUserIdAndCourseId } from "#modules/order/order.service.js";
import { STATUS_ENUM } from "#modules/order/order.model.js";
import * as cartMapper from "./cart.mapper.js";
import Cart from "./cart.model.js";

export const getCart = async (stuId, session = null) => {
  let cart = await Cart.findOne({ user: stuId })
    .populate("courses.course")
    .session(session)
    .lean()
  if (!cart) {
    cart = await Cart.create({ user: stuId, courses: [] });
  }

  return cartMapper.toCartItemsDto(cart);
};

export const addToCart = async (stuId, courseId) => {
  let cart = await Cart.findOne({ user: stuId });
  if (!cart) {
    cart = await Cart.create({ user: stuId, courses: [] });
  }

  const courseExists = cart.courses.some(c =>
    c.course?.toString() === courseId);
  if (courseExists) throw new AppError("Course already in cart.", 409);

  const orderStatus = await getOrderStatusByUserIdAndCourseId(stuId, courseId);
  if (orderStatus === STATUS_ENUM.completed)
    throw new AppError("You already own this course.", 409);
  if (orderStatus === STATUS_ENUM.pending)
    throw new AppError("This course is already in a pending order.", 409);

  cart.courses.push({ course: courseId });
  await cart.save();

  return cartMapper.toCartItemsDto(await cart.populate("courses.course"));
};

export const bulkRemoveFromCart = async (stuId, courseIds, session = null) => {
  if (courseIds?.length === 0)
    throw new AppError("Please provide at least one coure to remove from cart.", 400);

  let cart = await Cart.findOne({ user: stuId }).session(session);
  if (!cart) {
    cart = await Cart.create([{ user: stuId, courses: [] }], { session });
  }

  const initialCount = cart.courses.length;
  if (initialCount === 0)
    throw new AppError("Your cart is empty, there is nothing to remove.", 409);

  const idsToRemove = new Set(courseIds);
  cart.courses = cart.courses.filter(item =>
    !idsToRemove.has(item.course?.toString())
  );

  const removedCount = initialCount - cart.courses.length;
  await cart.save({ session });

  await cart.populate()

  return {
    cart: cartMapper.toCartItemsDto(await cart.populate("courses.course")),
    removedCount,
  };
};

export const clearCart = async (stuId) => {
  const result = await Cart.updateOne(
    { user: stuId },
    { $set: { courses: [] } }
  );

  return result.matchedCount === 1;
};

export const countCartItems = async (stuId) => {
  const cart = await Cart.findOne({ user: stuId })
    .select({ itemCount: { $size: "$courses" } })
    .lean();

  return cart?.itemCount || 0;
};

export default {
  getCart,
  addToCart,
  bulkRemoveFromCart,
  clearCart,
  countCartItems,
};