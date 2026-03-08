import mongoose from "mongoose";

const learningStreakSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    required: true,
  },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: String },
  activeDates: [{ type: String }],
}, { timestamps: true });

function formatYMD(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return formatYMD(d);
}

learningStreakSchema.statics.registerActivity = async function (user, dateInput) {
  const LearningStreak = this;

  const todayStr =
    typeof dateInput === "string" ? dateInput : formatYMD(dateInput || new Date());

  let streak = await LearningStreak.findOne({ user });

  if (!streak) {
    streak = await LearningStreak.create({
      user,
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: todayStr,
      activeDates: [todayStr],
    });
    return streak;
  }

  if (streak.lastActiveDate === todayStr) { return streak; }

  const nextDayOfLast = addDays(streak.lastActiveDate, 1);

  if (nextDayOfLast === todayStr) { streak.currentStreak += 1; } 
  else if (todayStr > streak.lastActiveDate) { streak.currentStreak = 1; }

  streak.lastActiveDate = todayStr;

  if (!streak.activeDates.includes(todayStr)) { streak.activeDates.push(todayStr); }

  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }

  await streak.save();
  return streak;
};

learningStreakSchema.statics.getUserStreak = async function (user) {
  const LearningStreak = this;
  const streak = await LearningStreak.findOne({ user });

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

export default mongoose.model("LearningStreak", learningStreakSchema);