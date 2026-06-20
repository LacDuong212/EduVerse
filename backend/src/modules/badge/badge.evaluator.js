import Badge from "./badge.model.js";
import UserBadge from "./user-badge.model.js";

// Maps each trigger event to the condition types it can satisfy.
// Only badges whose condition.type is in this list are queried per event —
// avoids evaluating irrelevant badges on every call.
const EVENT_TO_CONDITIONS = {
  streak_updated:    ["streak_current", "streak_longest"],
  lecture_completed: ["lectures_total"],
  course_completed:  ["courses_total", "ai_score", "fast_finish"],
  quiz_submitted:    ["quiz_perfect_count"],
};

function isConditionMet(condition, ctx) {
  switch (condition.type) {
    case "streak_current":
      return (ctx.streakCurrent ?? 0) >= condition.threshold;
    case "streak_longest":
      return (ctx.streakLongest ?? 0) >= condition.threshold;
    case "lectures_total":
      return (ctx.lecturesTotal ?? 0) >= condition.threshold;
    case "courses_total":
      return (ctx.coursesTotal ?? 0) >= condition.threshold;
    case "quiz_perfect_count":
      return (ctx.perfectQuizCount ?? 0) >= condition.threshold;
    case "ai_score":
      return ctx.aiScore != null && ctx.aiScore >= condition.threshold;
    case "fast_finish":
      return (
        ctx.daysSinceFirstLecture != null &&
        ctx.daysSinceFirstLecture <= condition.threshold
      );
    default:
      return false;
  }
}

function getContextValue(conditionType, ctx) {
  return (
    {
      streak_current:     ctx.streakCurrent,
      streak_longest:     ctx.streakLongest,
      lectures_total:     ctx.lecturesTotal,
      courses_total:      ctx.coursesTotal,
      quiz_perfect_count: ctx.perfectQuizCount,
      ai_score:           ctx.aiScore,
      fast_finish:        ctx.daysSinceFirstLecture,
    }[conditionType] ?? 0
  );
}

/**
 * Evaluate badge conditions for a given event and award any newly qualified badges.
 *
 * @param {string} userId  - User ObjectId (string or ObjectId)
 * @param {string} event   - One of: streak_updated | lecture_completed | course_completed | quiz_submitted
 * @param {object} context - Values relevant to the event (see EVENT_TO_CONDITIONS)
 * @returns {Array}        - Array of awarded Badge documents (may be empty)
 *
 * This function is intentionally catch-all: it NEVER throws. Every call site wraps
 * it in try/catch as an extra guard, but the internal catch ensures badge failure
 * is isolated from the operation that triggered it.
 */
export async function evaluateAndAward(userId, event, context) {
  try {
    const conditionTypes = EVENT_TO_CONDITIONS[event];
    if (!conditionTypes) return [];

    const [badges, earnedDocs] = await Promise.all([
      Badge.find({ isActive: true, "condition.type": { $in: conditionTypes } }).lean(),
      UserBadge.find({ user: userId }, "badge").lean(),
    ]);

    const earnedSet = new Set(earnedDocs.map((d) => d.badge.toString()));

    const toAward = badges.filter(
      (b) =>
        !earnedSet.has(b._id.toString()) && isConditionMet(b.condition, context)
    );

    if (!toAward.length) return [];

    const docs = toAward.map((b) => ({
      user:         userId,
      badge:        b._id,
      earnedAt:     new Date(),
      triggerEvent: event,
      triggerValue: getContextValue(b.condition.type, context),
    }));

    // ordered: false → the unique index silently drops any duplicate that slips
    // through under concurrent requests without rejecting the entire batch.
    await UserBadge.insertMany(docs, { ordered: false }).catch(() => {});

    return toAward;
  } catch {
    return [];
  }
}
