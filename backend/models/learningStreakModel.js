// models/learningStreakModel.js
import mongoose from "mongoose";

const learningStreakSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: String,
    },
    activeDates: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

// ===== Helpers nội bộ =====
function formatYMD(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return formatYMD(d);
}

// ===== Static: ghi nhận hoạt động trong ngày =====
// Gọi khi user hoàn thành ÍT NHẤT 1 lecture trong ngày
learningStreakSchema.statics.registerActivity = async function (userId, dateInput) {
  const LearningStreak = this;

  const todayStr =
    typeof dateInput === "string" ? dateInput : formatYMD(dateInput || new Date());

  let streak = await LearningStreak.findOne({ userId });

  // chưa có -> tạo mới
  if (!streak) {
    streak = await LearningStreak.create({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: todayStr,
      activeDates: [todayStr],
    });
    return streak;
  }

  // hôm nay đã ghi rồi → không làm gì
  if (streak.lastActiveDate === todayStr) {
    return streak;
  }

  const nextDayOfLast = addDays(streak.lastActiveDate, 1);

  if (nextDayOfLast === todayStr) {
    // ngày liền kề -> tăng streak
    streak.currentStreak += 1;
  } else if (todayStr > streak.lastActiveDate) {
    // ngày mới nhưng cách xa -> reset streak = 1
    streak.currentStreak = 1;
  }
  // (nếu todayStr < lastActiveDate thì trường hợp lệch thời gian, mình bỏ qua)

  streak.lastActiveDate = todayStr;

  if (!streak.activeDates.includes(todayStr)) {
    streak.activeDates.push(todayStr);
  }

  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }

  await streak.save();
  return streak;
};

// ===== Static: lấy streak của user =====
learningStreakSchema.statics.getUserStreak = async function (userId) {
  const LearningStreak = this;
  const streak = await LearningStreak.findOne({ userId });

  const todayStr = formatYMD(new Date());

  if (!streak) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      todayDone: false,
      activeDates: [],
    };
  }

  const todayDone = streak.lastActiveDate === todayStr;

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    todayDone,
    activeDates: streak.activeDates,
  };
};

const LearningStreak = mongoose.model("LearningStreak", learningStreakSchema);
export default LearningStreak;
