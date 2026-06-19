import mongoose from "mongoose";

const streakSchema = new mongoose.Schema({
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
  activityLog: { type: Map, of: Number, default: {} },
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

streakSchema.statics.registerActivity = async function (user, dateInput = null, session = null) {
  const LearningStreak = this;

  const todayStr =
    typeof dateInput === "string" ? dateInput : formatYMD(dateInput || new Date());

  let streak = await LearningStreak.findOne({ user }).session(session);

  if (!streak) {
    const [newStreak] = await LearningStreak.create(
      [{
        user: new mongoose.Types.ObjectId(user),
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: todayStr,
        activeDates: [todayStr],
      }],
      { session }
    );
    return newStreak;
  }

  if (streak.lastActiveDate === todayStr) return streak;

  const nextDayOfLast = addDays(streak.lastActiveDate, 1);
  if (nextDayOfLast === todayStr) streak.currentStreak += 1;
  else if (todayStr > streak.lastActiveDate) streak.currentStreak = 1;

  streak.lastActiveDate = todayStr;
  if (!streak.activeDates.includes(todayStr)) streak.activeDates.push(todayStr);
  if (streak.currentStreak > streak.longestStreak) streak.longestStreak = streak.currentStreak;

  await streak.save({ session });
  return streak;
};

streakSchema.statics.getUserStreak = async function (user) {
  const LearningStreak = this;
  const streak = await LearningStreak.findOne({ user });

  const todayStr = formatYMD(new Date());
  const yesterdayStr = addDays(todayStr, -1);

  if (!streak) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      todayDone: false,
      activeDates: [],
      activityLog: {},
    };
  }

  const isStreakBroken = streak.lastActiveDate < yesterdayStr;
  const todayDone = streak.lastActiveDate === todayStr;

  return {
    currentStreak: isStreakBroken ? 0 : streak.currentStreak,
    longestStreak: streak.longestStreak,
    todayDone,
    activeDates: streak.activeDates,
    activityLog: Object.fromEntries(streak.activityLog || new Map()),
  };
};

// Increment the daily lecture count for a user. Called on every completed lecture.
streakSchema.statics.incrementDailyCount = async function (user, dateInput = null, session = null) {
  const todayStr = typeof dateInput === "string" ? dateInput : formatYMD(dateInput || new Date());
  await this.updateOne(
    { user },
    { $inc: { [`activityLog.${todayStr}`]: 1 } },
    { session }
  );
};

export default mongoose.model("Streak", streakSchema);