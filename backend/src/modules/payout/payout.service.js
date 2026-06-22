import mongoose from "mongoose";
import Payout from "./payout.model.js";
import Instructor from "#modules/instructor/instructor.model.js";
import Order, { STATUS_ENUM as ORDER_STATUS } from "#modules/order/order.model.js";
import AppError from "#exceptions/app.error.js";
import { getPaginationOptions } from "#utils/pagination.js";

const INSTRUCTOR_NET_PROFIT = 0.8;

const getAvailableBalance = async (instructorId) => {
  const instructor = await Instructor.findOne({ user: instructorId, isApproved: true }).select("myCourses").lean();
  if (!instructor) throw new AppError("Instructor not found.", 404);

  const courseIds = instructor.myCourses || [];
  if (courseIds.length === 0) return 0;

  const [earningAgg, paidOutAgg] = await Promise.all([
    Order.aggregate([
      { $match: { status: ORDER_STATUS.completed, "courses.course": { $in: courseIds } } },
      { $unwind: "$courses" },
      { $match: { "courses.course": { $in: courseIds } } },
      { $group: { _id: null, total: { $sum: { $multiply: ["$courses.pricePaid", INSTRUCTOR_NET_PROFIT] } } } },
    ]),
    Payout.aggregate([
      { $match: { instructor: new mongoose.Types.ObjectId(instructorId), status: "paid", isDeleted: false } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const totalEarning = earningAgg[0]?.total ?? 0;
  const totalPaidOut = paidOutAgg[0]?.total ?? 0;
  return Math.max(0, totalEarning - totalPaidOut);
};

export const requestPayout = async (instructorId, { bankName, accountNumber, accountName, periodLabel }) => {
  const hasPending = await Payout.exists({ instructor: instructorId, status: "pending", isDeleted: false });
  if (hasPending) throw new AppError("You already have a pending payout request.", 400);

  const amount = await getAvailableBalance(instructorId);
  if (amount <= 0) throw new AppError("No available balance to withdraw.", 400);

  const payout = await Payout.create({
    instructor: instructorId,
    amount,
    bankInfo: { bankName, accountNumber, accountName },
    periodLabel: periodLabel || null,
  });

  return payout;
};

export const getMyPayouts = async (instructorId, query) => {
  const { page, limit, skip } = getPaginationOptions(query.page, query.limit);
  const filter = { instructor: instructorId, isDeleted: false };

  const instructorOid = new mongoose.Types.ObjectId(instructorId);

  const [payouts, total, statusAgg] = await Promise.all([
    Payout.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Payout.countDocuments(filter),
    Payout.aggregate([
      { $match: { instructor: instructorOid, isDeleted: false, status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const totalPaid = statusAgg[0]?.total ?? 0;

  return { payouts, total, page, limit, totalPaid };
};

export const getAllPayouts = async (query) => {
  const { page, limit, skip } = getPaginationOptions(query.page, query.limit);
  const filter = { isDeleted: false };
  if (query.status) filter.status = query.status;

  const [payouts, total] = await Promise.all([
    Payout.find(filter)
      .populate("instructor", "name email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payout.countDocuments(filter),
  ]);

  return { payouts, total, page, limit };
};

export const updatePayoutStatus = async (payoutId, { status, adminNote }) => {
  const payout = await Payout.findOne({ _id: payoutId, isDeleted: false })
    .populate("instructor", "name email avatar");
  if (!payout) throw new AppError("Payout request not found.", 404);
  if (payout.status !== "pending") throw new AppError("Only pending requests can be updated.", 400);

  payout.status = status;
  payout.adminNote = adminNote || null;
  payout.processedAt = new Date();
  await payout.save();

  return payout;
};
