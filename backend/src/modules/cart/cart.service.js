import AppError from "#exceptions/app.error.js";
import { publicCourseExist } from "#modules/course/course.service.js";
import { getOrderStatusByUserIdAndCourseId } from "#modules/order/order.service.js";
import { STATUS_ENUM } from "#modules/order/order.model.js";
import { withTransaction } from "#utils/transaction.js";
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
  return await withTransaction(async (session) => {
    const courseExists = await publicCourseExist(courseId);
    if (!courseExists) throw new AppError("Course is either unavailable or not found.", 404);

    const orderStatus = await getOrderStatusByUserIdAndCourseId(stuId, courseId);
    if (orderStatus === STATUS_ENUM.completed)
      throw new AppError("You already own this course.", 409);
    if (orderStatus === STATUS_ENUM.pending)
      throw new AppError("This course is already in a pending order.", 409);

    const updatedCart = await Cart.findOneAndUpdate(
      { user: stuId, "courses.course": { $ne: courseId } },
      {
        $addToSet: { courses: { course: courseId } }
      },
      {
        session,
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    if (!updatedCart)
      throw new AppError("Course already in cart.", 409);

    return cartMapper.toCartItemsDto(await updatedCart.populate("courses.course"));
  });
};

export const bulkRemoveFromCart = async (stuId, courseIds, session = null) => {
  if (courseIds?.length === 0)
    throw new AppError("Please provide at least one course to remove from cart.", 400);

  return await withTransaction(async (s) => {
    let cart = await Cart.findOne({ user: stuId }).session(s);
    if (!cart) {
      cart = await Cart.create([{ user: stuId, courses: [] }], { session: s });
    }

    const initialCount = cart.courses.length;
    if (initialCount === 0)
      throw new AppError("Your cart is empty, there is nothing to remove.", 409);

    const idsToRemove = new Set(courseIds);
    cart.courses = cart.courses.filter(item =>
      !idsToRemove.has(item.course?.toString())
    );

    const removedCount = initialCount - cart.courses.length;
    await cart.save({ session: s });

    return {
      cart: cartMapper.toCartItemsDto(await cart.populate("courses.course")),
      removedCount,
    };
  }, session);
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