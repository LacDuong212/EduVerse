export const toOrderDto = (order) => {
  if (!order) return null;

  return {
    orderId: order._id?.toString() || null,
    status: order.status || null,
    paymentMethod: order.paymentMethod || null,
    subTotal: Number(order.subTotal || 0),
    totalAmount: Number(order.totalAmount || 0),
    discountAmount: Number(order.discountAmount || 0),
    createdAt: order.createdAt || null,
    expiresAt: order.expiresAt || null,

    coupon: order.coupon
      ? {
        id: (order.coupon._id || order.coupon)?.toString() || null,
        code: order.coupon.code || null,
        discountPercent: order.coupon.discountPercent || 0,
      }
      : null,

    courses: Array.isArray(order.courses)
      ? order.courses
        .map((c) => {
          if (!c) return null;
          return {
            courseId: (c.course?._id || c.course)?.toString() || null,
            pricePaid: Number(c.pricePaid || 0),
          };
        })
        .filter(Boolean)
      : [],
  };
};

export const toOrderListDto = (order) => {
  if (!order) return null;

  return {
    orderId: order._id?.toString() || null,
    status: order.status || null,
    paymentMethod: order.paymentMethod || null,
    subTotal: Number(order.subTotal || 0),
    totalAmount: Number(order.totalAmount || 0),
    discountAmount: Number(order.discountAmount || 0),
    createdAt: order.createdAt || null,

    coursesCount: Number(order.coursesCount || order.courses?.length || 0),
    firstCourseTitle: order.firstCourseTitle || null,
    firstCourseImage: order.firstCourseImage || null,
    courses: Array.isArray(order.courses)
      ? order.courses.map((item) => {
        if (!item) return null;
        return {
          courseId: (item.course?._id || item.course)?.toString() || null,
          pricePaid: Number(item.pricePaid || 0),
          title: item.course?.title || null,
          image: item.course?.image || null,
          thumbnail: item.course?.thumbnail || null,
        };
      }).filter(Boolean)
      : [],
  };
};

export const toOrderListDtoList = (orders) =>
  Array.isArray(orders) ? orders.map(toOrderListDto) : [];

export const toOrderDetailDto = (order) => {
  if (!order) return null;

  return {
    orderId: order._id?.toString() || null,
    status: order.status || null,
    paymentMethod: order.paymentMethod || null,
    subTotal: Number(order.subTotal || 0),
    totalAmount: Number(order.totalAmount || 0),
    discountAmount: Number(order.discountAmount || 0),
    createdAt: order.createdAt || null,
    expiresAt: order.expiresAt || null,

    coupon: order.coupon
      ? {
        couponId: (order.coupon._id || order.coupon)?.toString() || null,
        code: order.coupon.code || null,
        discountPercent: order.coupon.discountPercent || null,
      }
      : null,

    courses: Array.isArray(order.courses)
      ? order.courses.map((item) => {
        if (!item) return null;
        return {
          courseId: (item.course?._id || item.course)?.toString() || null,
          pricePaid: Number(item.pricePaid || 0),
          title: item.course?.title || null,
          image: item.course?.image || null,
          thumbnail: item.course?.thumbnail || null,
        };
      }).filter(Boolean)
      : [],
  };
};