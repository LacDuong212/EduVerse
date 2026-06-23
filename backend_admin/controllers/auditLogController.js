import AuditLog from "../models/auditLogModel.js";

export const getAuditLogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const { adminId, action, entityType, from, to, search } = req.query;

    const filter = {};
    if (adminId) filter.adminId = adminId;
    if (action) filter.action = action;
    if (entityType) filter.entityType = entityType;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }
    if (search) {
      const regex = { $regex: search.trim(), $options: "i" };
      filter.$or = [
        { adminName: regex },
        { adminEmail: regex },
        { entityLabel: regex },
      ];
    }

    const [logs, totalItems] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      result: logs,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch audit logs." });
  }
};
