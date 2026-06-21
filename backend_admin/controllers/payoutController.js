import Payout from "../models/payoutModel.js";

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
  try {
    const { id }        = req.params;
    const { status, adminNote } = req.body;

    const allowed = ["approved", "paid", "rejected"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(", ")}.` });
    }

    const payout = await Payout.findOne({ _id: id, isDeleted: false })
      .populate("instructor", "name email pfpImg");

    if (!payout) {
      return res.status(404).json({ success: false, message: "Payout request not found." });
    }
    if (payout.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending requests can be updated." });
    }

    payout.status      = status;
    payout.adminNote   = adminNote?.trim() || null;
    payout.processedAt = new Date();
    await payout.save();

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
  } catch (error) {
    console.error("Error updating payout:", error);
    return res.status(500).json({ success: false, message: "Failed to update payout." });
  }
};
