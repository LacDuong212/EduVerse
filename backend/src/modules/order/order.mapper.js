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

export const toOrderListDto = (order) => ({
  orderId: String(order?._id || ""),
  createdAt: order?.createdAt || null,
  status: order?.status || "",
  paymentMethod: order?.paymentMethod || "",
  subTotal: Number(order?.subTotal || 0),
  discountAmount: Number(order?.discountAmount || 0),
  totalAmount: Number(order?.totalAmount || 0),
  coursesCount: Number(order?.coursesCount || order?.courses?.length || 0),
  firstCourseTitle: order?.firstCourseTitle || "",
  firstCourseImage: order?.firstCourseImage || "",
  courses: Array.isArray(order?.courses)
    ? order.courses.map((item) => ({
        pricePaid: Number(item?.pricePaid || 0),
        course: item?.course
          ? {
              courseId: String(item.course._id || ""),
              title: item.course.title || "",
              image: item.course.image || null,
              thumbnail: item.course.thumbnail || null,
            }
          : null,
      }))
    : [],
});

export const toOrderListDtoList = (orders) =>
  Array.isArray(orders) ? orders.map(toOrderListDto) : [];

export const toOrderDetailDto = (order) => ({
  orderId: String(order?._id || ""),
  createdAt: order?.createdAt || null,
  status: order?.status || "",
  paymentMethod: order?.paymentMethod || "",
  subTotal: Number(order?.subTotal || 0),
  discountAmount: Number(order?.discountAmount || 0),
  totalAmount: Number(order?.totalAmount || 0),
  coupon: order?.coupon
    ? {
        couponId: String(order.coupon._id || ""),
        code: order.coupon.code || "",
      }
    : null,
  courses: Array.isArray(order?.courses)
    ? order.courses.map((item) => ({
        pricePaid: Number(item?.pricePaid || 0),
        course: item?.course
          ? {
              courseId: String(item.course._id || ""),
              title: item.course.title || "",
              image: item.course.image || null,
              thumbnail: item.course.thumbnail || null,
            }
          : null,
      }))
    : [],
});