import Order from "./order.model.js";

export const countCompletedOrdersByCourseIds = async (courseIds = []) => {
  if (!courseIds || courseIds.length === 0) return 0;

  const count = await Order.countDocuments({
    status: "completed",
    "courses.course": { $in: courseIds }
  });

  return count;
};