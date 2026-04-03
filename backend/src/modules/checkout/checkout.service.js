import AppError from "#exceptions/app.error.js";
import * as cartService from "#modules/cart/cart.service.js";
import * as couponService from "#modules/coupon/coupon.service.js";
import { enrollsCourses } from "#modules/enrollment/enrollment.service.js";
import Order, { STATUS_ENUM } from "#modules/order/order.model.js";
import { withTransaction } from "#utils/transaction.js";

export const placeOrder = async (userId, body) => {
  const { selectedCourseIds, paymentMethod, couponCode } = body;

  if (!selectedCourseIds?.length) throw new AppError("No courses selected.", 400);

  return await withTransaction(async (session) => {
    const cart = await cartService.getCart(userId, session);
    if (!cart?.length) throw new AppError("Your cart is empty.", 400);

    const selectedItems = cart.filter(item => selectedCourseIds.includes(item?.courseId));
    if (!selectedItems.length) throw new AppError("Selected courses not found in cart.", 409);

    let couponDoc = null;
    if (couponCode) {
      couponDoc = await couponService.validateCoupon(couponCode, userId, session);
    }

    const {
      items, subTotal, discountAmount, totalAmount
    } = calculateOrderTotals(selectedItems, couponDoc);

    const isFree = totalAmount === 0;

    const [order] = await Order.create([{
      user: userId,
      courses: items,
      subTotal,
      coupon: couponDoc?._id,
      discountAmount,
      totalAmount,
      paymentMethod: isFree ? "free" : paymentMethod,
      status: isFree ? STATUS_ENUM.completed : STATUS_ENUM.pending
    }], { session });

    if (couponDoc) {
      await couponService.updateUsedCoupon(couponDoc._id, userId, session);
    }

    if (isFree) {
      await enrollsCourses(userId, selectedCourseIds, session);
      await cartService.bulkRemoveFromCart(userId, selectedCourseIds, session);
    }

    return order;
  });
};

const calculateOrderTotals = (selectedItems, couponDoc) => {
  const items = selectedItems.map(item => ({
    course: item?.courseId,
    pricePaid: item?.enableDiscount ? (item?.discountPrice ?? item?.price) : item?.price
  }));

  const subTotal = items.reduce((sum, i) => sum + i.pricePaid, 0);
  const discountAmount = couponDoc
    ? Math.round((subTotal * couponDoc.discountPercent) / 100)
    : 0;

  return {
    items,
    subTotal,
    discountAmount,
    totalAmount: Math.max(subTotal - discountAmount, 0)
  };
};