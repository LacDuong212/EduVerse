import LearningStreak from "../models/learningStreakModel.js";
import Notification from "../models/notificationModel.js";
import { getIO, getOnlineUsers } from "../configs/socket.js";

const sendStreakNotification = async (userId, days) => {
  try {
    const message = `🔥 Great! You've achieved a streak of ${days} of consecutive study days. Keep up the good work!`;
    const type = "SUCCEEDED";

    const newNoti = await Notification.create({ 
        userId: String(userId), 
        message, 
        type 
    });

    const onlineUsers = getOnlineUsers();
    const receiver = onlineUsers.find((user) => user.userId === String(userId));

    if (receiver) {
      const io = getIO();
      if (io) {
        io.to(receiver.socketId).emit("getNotification", newNoti);
        console.log(`[Streak] Sent notification to user ${userId} for ${days} days.`);
      }
    }
  } catch (error) {
    console.error(`[Streak Helper Error]:`, error.message);
  }
};

export const updateStreak = async (req, res) => {
  try {
    const userId = req.userId;

    const updatedStreak = await LearningStreak.registerActivity(userId);

    if ([14, 30, 60].includes(updatedStreak.currentStreak)) {
       sendStreakNotification(userId, updatedStreak.currentStreak);
    }

    return res.json({
      success: true,
      streak: updatedStreak,
    });
  } catch (error) {
    console.error("updateStreak error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMyStreak = async (req, res) => {
  try {
    const userId = req.userId;

    const streak = await LearningStreak.getUserStreak(userId);

    return res.json({
      success: true,
      streak,
    });
  } catch (error) {
    console.error("getMyStreak error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
};
