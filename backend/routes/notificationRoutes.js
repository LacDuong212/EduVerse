import express from "express";
import Notification from "../models/notificationModel.js";

const router = express.Router();

// 1. GET: Lấy danh sách thông báo của User
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    // Lấy thông báo mới nhất lên đầu (sort -1)
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. PUT: Đánh dấu tất cả là đã đọc
router.put("/mark-all-read/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    await Notification.updateMany(
      { userId: userId, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ success: true, message: "All marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. PUT: Đánh dấu 1 thông báo cụ thể là đã đọc
router.put("/:id/read", async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/clear-all/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    await Notification.deleteMany({ userId: userId });

    res.status(200).json({ success: true, message: "All notifications deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;