export const toOrderDto = (order) => {
  if (!order) return null;

  return {
    orderId: order._id?.toString(),
    status: order.status,
    paymentMethod: order.paymentMethod,
    totalAmount: order.totalAmount,
    discountAmount: order.discountAmount,
    subTotal: order.subTotal,
    createdAt: order.createdAt,
    expiresAt: order.expiresAt || null,

    coupon: order.coupon
      ? {
        id: order.coupon._id?.toString(),
        code: order.coupon.code,
        discountPercent: order.coupon.discountPercent
      }
      : null,

    courses: order.courses?.map(c => {
      const course = c.course;

      return {
        courseId: course?._id?.toString?.() || course?.toString?.(),
        pricePaid: c.pricePaid
      };
    })
  };
};

export const toOrderDtoList = (orders) => {
  if (!Array.isArray(orders)) return [];
  return orders.map(toOrderDto);
};