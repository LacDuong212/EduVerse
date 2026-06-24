import mongoose from "mongoose";
import Payout from "../models/payoutModel.js";
import { TYPE_ENUM as NOTIF_TYPE } from "../models/notificationModel.js";
import { logAction, ACTION, ENTITY } from "../utils/auditLogger.js";
import { createNotifications, notifyUsers } from "../utils/notification.js";
import { SUPPORT_EMAIL } from "../utils/constants.js";

// GET /api/payouts
export const getAllPayouts = async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 20);
    const skip   = (page - 1) * limit;
    const status = req.query.status?.trim();

    const filter = { isDeleted: false };
    if (status) filter.status = status;

    const [payouts, totalItems] = await Promise.all([
      Payout.find(filter)
        .populate("instructor", "name email pfpImg")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payout.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    const result = payouts.map((p) => ({
      id:          p._id.toString(),
      amount:      p.amount,
      bankInfo:    p.bankInfo,
      status:      p.status,
      adminNote:   p.adminNote   || null,
      periodLabel: p.periodLabel || null,
      processedAt: p.processedAt || null,
      createdAt:   p.createdAt,
      instructor: {
        id:     p.instructor?._id?.toString(),
        name:   p.instructor?.name   || null,
        email:  p.instructor?.email  || null,
        avatar: p.instructor?.pfpImg || null,
      },
    }));

    return res.json({
      success: true,
      result,
      pagination: { page, limit, totalItems, totalPages },
    });
  } catch (error) {
    console.error("Error fetching payouts:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch payouts." });
  }
};

// PATCH /api/payouts/:id
export const updatePayoutStatus = async (req, res) => {
  const { id }             = req.params;
  const { status, adminNote } = req.body;

  const allowed = ["paid", "rejected"];
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(", ")}.` });
  }
  if (status === "rejected" && !adminNote?.trim())
    return res.status(400).json({ success: false, message: "A reason is required when rejecting a payout." });

  const payout = await Payout.findOne({ _id: id, isDeleted: false })
    .populate("instructor", "name email pfpImg");

  if (!payout)
    return res.status(404).json({ success: false, message: "Payout request not found." });
  if (payout.status !== "pending")
    return res.status(400).json({ success: false, message: "Only pending requests can be updated." });

  const prevStatus     = payout.status;
  const instructorId   = payout.instructor?._id;
  const amountFormatted = payout.amount?.toLocaleString("vi-VN");

  const notifMessage = status === "paid"
    ? `Your payout request of ${amountFormatted}₫ has been approved and processed. The funds have been transferred to your registered bank account.`
    : `Your payout request of ${amountFormatted}₫ has been rejected.\nReason: "${adminNote.trim()}".\nIf you have any questions, please contact <${SUPPORT_EMAIL}>.`;

  let session = await mongoose.startSession();
  session.startTransaction();

  try {
    payout.status      = status;
    payout.adminNote   = adminNote?.trim() || null;
    payout.processedAt = new Date();
    await payout.save({ session });

    await createNotifications(
      [instructorId],
      status === "paid" ? NOTIF_TYPE.succeeded : NOTIF_TYPE.rejected,
      notifMessage,
      session,
    );

    await session.commitTransaction();
    session.endSession();
    session = null;
  } catch (error) {
    if (session) {
      await session.abortTransaction();
      await session.endSession();
    }
    console.error("Error updating payout:", error);
    return res.status(500).json({ success: false, message: "Failed to update payout." });
  }

  // Real-time delivery is non-critical — don't block the response
  try {
    await notifyUsers({ userIds: [instructorId] });
  } catch (notifyErr) {
    console.error("[UpdatePayoutStatus]: Real-time notification delivery failed (non-critical):", notifyErr.message);
  }

  logAction({
    adminId:     req.admin._id,
    adminName:   req.admin.name,
    action:      status === "paid" ? ACTION.PAYOUT_MARK_PAID : ACTION.PAYOUT_REJECT,
    entityType:  ENTITY.PAYOUT,
    entityId:    payout._id,
    entityLabel: `${payout.instructor?.name || "Unknown"} — ${amountFormatted}₫`,
    before:      { status: prevStatus },
    after:       { status },
    reason:      payout.adminNote || null,
    req,
  });

  return res.json({
    success: true,
    message: `Payout marked as ${status}.`,
    result: {
      id:          payout._id.toString(),
      amount:      payout.amount,
      bankInfo:    payout.bankInfo,
      status:      payout.status,
      adminNote:   payout.adminNote   || null,
      periodLabel: payout.periodLabel || null,
      processedAt: payout.processedAt || null,
      createdAt:   payout.createdAt,
      instructor: {
        id:     payout.instructor?._id?.toString(),
        name:   payout.instructor?.name   || null,
        email:  payout.instructor?.email  || null,
        avatar: payout.instructor?.pfpImg || null,
      },
    },
  });
};
