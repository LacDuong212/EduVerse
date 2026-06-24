import CourseProgress from "../models/courseProgressModel.js";
import User from "../models/userModel.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/admin/certificates — paginated list with search + time-range filter
export const getAllCertificates = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const q    = req.query.q?.trim();
    const from = req.query.from?.trim();
    const to   = req.query.to?.trim();

    const filter = { certId: { $ne: null }, isCompleted: true };

    // Time-range filter on issue date
    if (from || to) {
      filter.certIssuedAt = {};
      if (from) filter.certIssuedAt.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        filter.certIssuedAt.$lte = end;
      }
    }

    // Search: certificate id, or student name/email (resolve user ids first)
    if (q) {
      const rx = new RegExp(escapeRegex(q), "i");
      const users = await User.find(
        { $or: [{ name: rx }, { email: rx }] },
        { _id: 1 }
      ).lean();
      filter.$or = [{ certId: rx }, { user: { $in: users.map((u) => u._id) } }];
    }

    const [rows, totalItems] = await Promise.all([
      CourseProgress.find(filter)
        .populate("user", "name email pfpImg")
        .populate("course", "title instructor")
        .sort({ certIssuedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CourseProgress.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    const result = rows.map((r) => ({
      certId:         r.certId,
      issuedAt:       r.certIssuedAt || r.updatedAt || null,
      courseTitle:    r.course?.title || "Untitled Course",
      instructorName: r.course?.instructor?.name || null,
      student: {
        id:     r.user?._id?.toString(),
        name:   r.user?.name   || null,
        email:  r.user?.email  || null,
        avatar: r.user?.pfpImg || null,
      },
    }));

    return res.json({
      success: true,
      result,
      pagination: { page, limit, totalItems, totalPages },
    });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch certificates." });
  }
};
