import Order from "./order.model.js";

export const countCompletedOrdersByCourseIds = async (courseIds = []) => {
  if (!courseIds || courseIds.length === 0) return 0;

  const count = await Order.countDocuments({
    status: "completed",
    "courses.course": { $in: courseIds }
  });

  return count;
};

export const getOrderStatusByUserIdAndCourseId = async (userId, courseId) => {
  if (!userId || !courseId) return null;

  const order = await Order.findOne({
    user: userId,
    "courses.course": courseId,
  }).lean();

  if (!order) return null;
  else return order.status || null;
};