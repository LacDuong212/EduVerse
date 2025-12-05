// controllers/streakController.js
import LearningStreak from "../models/learningStreakModel.js";

export const getMyStreak = async (req, res) => {
  try {
    const userId = req.userId; // giống pattern các controller khác

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
