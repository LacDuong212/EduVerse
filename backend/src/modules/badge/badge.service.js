import Badge from "./badge.model.js";
import UserBadge from "./user-badge.model.js";
import Streak from "#modules/streak/streak.model.js";
import Student from "#modules/student/student.model.js";
import QuizProgress from "#modules/quiz/quiz-progress.model.js";

export const getAllBadges = async () => {
  return Badge.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
};

async function fetchUserStats(userId) {
  const [streak, student, quizProgressDocs] = await Promise.all([
    Streak.findOne({ user: userId }).select("currentStreak longestStreak").lean(),
    Student.findOne({ user: userId }).select("stats").lean(),
    QuizProgress.find({ user: userId }).select("quizzes").lean(),
  ]);

  const perfectCount = quizProgressDocs.reduce(
    (n, p) =>
      n + p.quizzes.filter((q) => q.score === q.totalQuestions && q.totalQuestions > 0).length,
    0
  );

  return {
    streakCurrent: streak?.currentStreak ?? 0,
    streakLongest: streak?.longestStreak ?? 0,
    lecturesTotal: student?.stats?.completedLectures ?? 0,
    coursesTotal:  student?.stats?.completedCourses ?? 0,
    perfectCount,
  };
}

function getProgress(condition, stats) {
  const { type, threshold } = condition;
  switch (type) {
    case "streak_current":
      return { current: Math.min(stats.streakCurrent, threshold), max: threshold };
    case "streak_longest":
      return { current: Math.min(stats.streakLongest, threshold), max: threshold };
    case "lectures_total":
      return { current: Math.min(stats.lecturesTotal, threshold), max: threshold };
    case "courses_total":
      return { current: Math.min(stats.coursesTotal, threshold), max: threshold };
    case "quiz_perfect_count":
      return { current: Math.min(stats.perfectCount, threshold), max: threshold };
    default:
      // ai_score and fast_finish have no meaningful linear progress to display
      return null;
  }
}

export const getUserBadges = async (userId) => {
  const [allBadges, earnedDocs, stats] = await Promise.all([
    Badge.find({ isActive: true }).sort({ sortOrder: 1 }).lean(),
    UserBadge.find({ user: userId }).populate("badge").lean(),
    fetchUserStats(userId),
  ]);

  const earnedMap = new Map(
    earnedDocs
      .filter((d) => d.badge)
      .map((d) => [d.badge._id.toString(), d])
  );

  const earned = [];
  const locked = [];

  for (const badge of allBadges) {
    const userBadge = earnedMap.get(badge._id.toString());
    if (userBadge) {
      earned.push({
        key:         badge.key,
        name:        badge.name,
        icon:        badge.icon,
        description: badge.description,
        category:    badge.category,
        rarity:      badge.rarity,
        earnedAt:    userBadge.earnedAt,
      });
    } else {
      locked.push({
        key:         badge.key,
        name:        badge.name,
        icon:        badge.icon,
        description: badge.description,
        category:    badge.category,
        rarity:      badge.rarity,
        condition:   badge.condition,
        progress:    getProgress(badge.condition, stats),
      });
    }
  }

  return {
    earned,
    locked,
    stats: {
      streakCurrent: stats.streakCurrent,
      streakLongest: stats.streakLongest,
      lecturesTotal: stats.lecturesTotal,
      coursesTotal:  stats.coursesTotal,
      perfectCount:  stats.perfectCount,
    },
  };
};
