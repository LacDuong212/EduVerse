import CourseProgress from "../models/courseProgressModel.js";

const TARGET_PER_CATEGORY = 5;

// ✅ Helper: clamp % 0..100
const toPercent = (count) =>
  Math.min(100, Math.round((count * 100) / TARGET_PER_CATEGORY));

/**
 * Build radar data for ONE user
 * returns: { labels, values, raw }
 */
const buildUserRadar = async (userId) => {
  const progresses = await CourseProgress.find({ userId }).populate({
    path: "courseId",
    select: "category",
    populate: { path: "category", select: "name slug" },
  });

  const completed = progresses.filter(
    (p) => p.totalLectures > 0 && p.completedLecturesCount === p.totalLectures
  );

  const counter = {}; // { [categoryName]: completedCount }
  for (const p of completed) {
    const cat = p.courseId?.category?.name;
    if (!cat) continue;
    counter[cat] = (counter[cat] || 0) + 1;
  }

  const labels = Object.keys(counter).sort((a, b) => a.localeCompare(b));
  const values = labels.map((cat) => toPercent(counter[cat]));

  return { labels, values, raw: counter };
};

/**
 * Build SYSTEM average radar (average of user percentages) for given labels
 * returns: { systemAvgValues, raw }
 *
 * - Only averages among users who have at least 1 completed course in that category.
 * - If a category not present => 0 (so FE can render aligned datasets).
 */
const buildSystemAverageRadar = async (labels) => {
  if (!labels?.length) return { systemAvgValues: [], raw: {} };

  // ✅ 0) Chỉ lấy những user đã bắt đầu học (có CourseProgress)
  const activeUserIds = await CourseProgress.distinct("userId");
  const activeCount = activeUserIds.length;

  if (!activeCount) {
    return { systemAvgValues: labels.map(() => 0), raw: {} };
  }

  // ✅ 1) Lấy tất cả completed progress (toàn hệ thống) nhưng CHỈ trong nhóm active users
  const allCompleted = await CourseProgress.find({
    userId: { $in: activeUserIds },
    totalLectures: { $gt: 0 },
    $expr: { $eq: ["$completedLecturesCount", "$totalLectures"] },
  }).populate({
    path: "courseId",
    select: "category",
    populate: { path: "category", select: "name" },
  });

  // ✅ 2) Count completed per user per category
  const userCatCount = {}; // { [userId]: { [cat]: count } }
  for (const p of allCompleted) {
    const uid = String(p.userId);
    const cat = p.courseId?.category?.name;
    if (!cat) continue;

    if (!userCatCount[uid]) userCatCount[uid] = {};
    userCatCount[uid][cat] = (userCatCount[uid][cat] || 0) + 1;
  }

  // ✅ 3) Average theo active learners: user không có completed category đó sẽ đóng góp 0%
  const systemAvg = {};
  for (const cat of labels) {
    let sum = 0;

    for (const uid of activeUserIds) {
      const c = userCatCount[String(uid)]?.[cat] || 0;
      const pct = Math.min(100, Math.round((c * 100) / TARGET_PER_CATEGORY));
      sum += pct;
    }

    systemAvg[cat] = Math.round(sum / activeCount);
  }

  return {
    systemAvgValues: labels.map((cat) => systemAvg[cat] ?? 0),
    raw: systemAvg,
  };
};

// GET /api/student/skill-radar
export const getSkillRadar = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.userId;

    // ✅ 1) user radar
    const userRadar = await buildUserRadar(userId);

    // ✅ 2) system average (aligned to user's labels)
    const systemRadar = await buildSystemAverageRadar(userRadar.labels);

    return res.json({
      success: true,
      labels: userRadar.labels,
      values: userRadar.values,
      systemAvgValues: systemRadar.systemAvgValues,
      raw: {
        user: userRadar.raw,
        systemAvg: systemRadar.raw,
      },
    });
  } catch (error) {
    console.error("getSkillRadar error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to build skill radar",
    });
  }
};
