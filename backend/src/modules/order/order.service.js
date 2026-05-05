import mongoose from "mongoose";
import Fuse from "fuse.js";
import Order, { STATUS_ENUM } from "./order.model.js";
import AppError from "#exceptions/app.error.js";
import { getPaginationOptions } from "#utils/pagination.js";

export const getUserOrdersStats = async (userId) => {
  if (!userId) throw new AppError("User ID is required.", 400);

  const [result] = await Order.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $facet: {
        total: [{ $count: "count" }],
        completed: [{ $match: { status: STATUS_ENUM.completed } }, { $count: "count" }],
        pending: [{ $match: { status: STATUS_ENUM.pending } }, { $count: "count" }],
        cancelled: [{ $match: { status: STATUS_ENUM.cancelled } }, { $count: "count" }],
        refunded: [{ $match: { status: STATUS_ENUM.refunded } }, { $count: "count" }],
      },
    },
  ]);

  return {
    total: result?.total?.[0]?.count || 0,
    completed: result?.completed?.[0]?.count || 0,
    pending: result?.pending?.[0]?.count || 0,
    cancelled: result?.cancelled?.[0]?.count || 0,
    refunded: result?.refunded?.[0]?.count || 0,
  };
};

const sortOrdersInMemory = (docs, strategy) => {
  const strategies = {
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    totalAsc: (a, b) => Number(a.totalAmount || 0) - Number(b.totalAmount || 0),
    totalDesc: (a, b) => Number(b.totalAmount || 0) - Number(a.totalAmount || 0),
    statusAsc: (a, b) => String(a.status || "").localeCompare(String(b.status || "")),
    statusDesc: (a, b) => String(b.status || "").localeCompare(String(a.status || "")),
  };

  return docs.sort(strategies[strategy] || strategies.newest);
};

const getOrderDbSort = (strategy) =>
  ({
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    totalAsc: { totalAmount: 1 },
    totalDesc: { totalAmount: -1 },
    statusAsc: { status: 1, createdAt: -1 },
    statusDesc: { status: -1, createdAt: -1 },
  }[strategy] || { createdAt: -1 });

export const getPaginatedUserOrders = async (userId, filters) => {
  if (!userId) throw new AppError("User ID is required.", 400);

  const { page, limit, skip } = getPaginationOptions(filters.page, filters.limit);
  const { search, sort, status } = filters;

  const match = {
    user: new mongoose.Types.ObjectId(userId),
  };

  if (status) {
    match.status = status;
  }

  const getBasePipeline = (safetyLimit = null) => {
    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: "courses",
          localField: "courses.course",
          foreignField: "_id",
          as: "courseDocs",
        },
      },
      {
        $addFields: {
          courses: {
            $map: {
              input: "$courses",
              as: "item",
              in: {
                course: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$courseDocs",
                        as: "c",
                        cond: { $eq: ["$$c._id", "$$item.course"] },
                      },
                    },
                    0,
                  ],
                },
                pricePaid: "$$item.pricePaid",
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          status: 1,
          paymentMethod: 1,
          subTotal: 1,
          discountAmount: 1,
          totalAmount: 1,
          coupon: 1,
          courses: 1,
          firstCourseTitle: {
            $ifNull: [{ $arrayElemAt: ["$courses.course.title", 0] }, ""],
          },
          firstCourseImage: {
            $ifNull: [
              { $arrayElemAt: ["$courses.course.thumbnail", 0] },
              { $arrayElemAt: ["$courses.course.image", 0] },
            ],
          },
          coursesCount: { $size: { $ifNull: ["$courses", []] } },
        },
      },
    ];

    if (safetyLimit) pipeline.push({ $limit: safetyLimit });
    return pipeline;
  };

  if (search) {
    const candidates = await Order.aggregate(getBasePipeline(500));

    const fuse = new Fuse(candidates, {
      keys: ["_id", "firstCourseTitle"],
      threshold: 0.35,
    });

    const searchResults = fuse.search(search).map((r) => r.item);
    const sorted = sortOrdersInMemory(searchResults, sort);

    return {
      orders: sorted.slice(skip, skip + limit),
      total: sorted.length,
      page,
      limit,
    };
  }

  const dbSort = getOrderDbSort(sort);

  const [result] = await Order.aggregate([
    ...getBasePipeline(),
    { $sort: dbSort },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    },
  ]);

  const total = result?.metadata?.[0]?.total || 0;
  const orders = result?.data || [];

  return { orders, total, page, limit };
};

export const getUserOrderDetail = async (userId, orderId) => {
  if (!userId) throw new AppError("User ID is required.", 400);
  if (!orderId) throw new AppError("Order ID is required.", 400);

  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  })
    .populate("courses.course")
    .populate("coupon")
    .lean();

  if (!order) {
    throw new AppError("Order not found.", 404);
  }

  return order;
};

export const cancelOrder = async (orderId, userId) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  if (!order) throw new AppError("Order not found.", 404);

  if (order.status !== STATUS_ENUM.pending)
    throw new AppError("Processed orders cannot be cancelled", 409);

  order.status = STATUS_ENUM.cancelled;
  await order.save();

  return order;
};

export const countCompletedOrdersByCourseIds = async (courseIds = []) => {
  if (!courseIds || courseIds.length === 0) return 0;

  const count = await Order.countDocuments({
    status: STATUS_ENUM.completed,
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