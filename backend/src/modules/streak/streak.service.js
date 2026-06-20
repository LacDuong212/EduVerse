import AppError from "#exceptions/app.error.js";
import { TYPE_ENUM as NOTIF_TYPE } from "#modules/notification/notification.model.js";
import { sendNotification } from "#modules/notification/notification.service.js";
import { evaluateAndAward } from "#modules/badge/badge.evaluator.js";
import { withTransaction } from "#utils/transaction.js";
import Streak from "./streak.model.js";

// #TODO: need checking & handle 365+ logging
export const updateStreak = async (stuId) => {
  if (!stuId) throw new AppError("Student ID is required.", 400);

  await withTransaction(async (session) => {
    const streak = await Streak.registerActivity(stuId, new Date(), session);

    const MILESTONE_MESSAGES = {
      3: "3-Day warmup! You're starting to build a rhythm. Keep it up! 🔥",
      5: "High FIVE! 5 days of showing up for yourself. ✋✨",
      7: "One week strong! 7 days of consistent growth. You're on fire! ⚡🔥",

      10: "Double digits! 10 days in a row!? Building a habit, I see. 🔟💪",
      14: "Fortnight champion! 2 weeks of dedication!? INCREDIBLE! 🛡️",
      21: "21-Day habit! They say it takes 21 days to form a habit and you proved it! 🧠✅",
      30: "Month 1 master! 30 days of non-stop learning. What a legend! 😝🎉",

      40: "40 days of focus!? Your discipline is truly inspiring! 🎯",
      50: "The golden 50! Halfway to a hundred. Don't stop now! 🌕⭐",
      60: "Two-month milestone!? Level 60 babyyyyyyyy!!! 📈🚀",
      75: "75-day diamond streak! Shine bright like a diamond. 🎵💎✨",
      90: "Quarter-year madness! 90 days of pure grit. 🏆🔥",

      100: "💯 HUNDRED DAYS! You are officially in the top 1% of learners, congrats! 💯🎊",
      120: "120 days! Four months of transforming your future. 🙏🌟",
      150: "150-day marathon! You have the heart of a champion. 🏃‍♂️💨",
      180: "Half a year! 180 days of showing up. Simply AMAZING! 🌓🎆",
      200: "Double century! 200 days...is there anything you can't do? 🎖️",

      250: "250 days! You are a master of consistency. 🧘‍♂️⛩️",
      300: "300-day spartan streak! Nearly a full year of progress. Keep fighting! 🛡️⚔️",
      330: "11 months! The one-year finish line is in sight! 🏁👀",
      365: "ONE. FULL. YEAR!!? The 👑 is yours.",
    };

    const message = MILESTONE_MESSAGES[streak.currentStreak];

    if (message)
      await sendNotification(stuId, NOTIF_TYPE.succeeded, message, session);
  });

  const streak = await Streak.getUserStreak(stuId);

  try {
    await evaluateAndAward(stuId, "streak_updated", {
      streakCurrent: streak.currentStreak,
      streakLongest: streak.longestStreak,
    });
  } catch { /* badge failure must not affect streak update */ }

  return streak;
};

export const getStreak = async (stuId) => {
  if (!stuId) throw new AppError("Student ID is required.", 400);
  return await Streak.getUserStreak(stuId);
};

export const incrementDailyCount = async (stuId, session = null) => {
  if (!stuId) return;
  await Streak.incrementDailyCount(stuId, null, session);
};