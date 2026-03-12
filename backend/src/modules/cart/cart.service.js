import AppError from "#exceptions/app.error.js";
import { getOrderStatusByUserIdAndCourseId } from "#modules/order/order.service.js";
import { STATUS_ENUM } from "#modules/order/order.model.js";
import * as cartMapper from "./cart.mapper.js";
import Cart from "./cart.model.js";

export const getCart = async (stuId) => {
  let cart = await Cart.findOne({ user: stuId })
    .populate("courses.course")
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

  return (await getCart(stuId));
};

export default {
  getCart,
  addToCart,
};