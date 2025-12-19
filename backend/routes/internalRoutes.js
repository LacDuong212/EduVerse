import express from "express";
import Notification from "../models/notificationModel.js";
import { getIO, getOnlineUsers } from "../configs/socket.js";

const router = express.Router();

// Route: POST /api/internal/notify
router.post("/notify", async (req, res) => {
  try {
    const { userId, message, type } = req.body;

    // BƯỚC 1: Lưu vào DB (Quan trọng nhất)
    const newNoti = await Notification.create({ userId, message, type });

    // BƯỚC 2: Kiểm tra Online và bắn Socket
    const onlineUsers = getOnlineUsers();
    const receiver = onlineUsers.find((user) => user.userId === userId);

    if (receiver) {
      const io = getIO();
      io.to(receiver.socketId).emit("getNotification", newNoti);
      console.log(`[Socket] Sent to user ${userId}`);
    } else {
      console.log(`[Socket] User ${userId} offline. Saved to DB.`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;