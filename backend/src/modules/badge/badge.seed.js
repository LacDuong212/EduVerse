/**
 * Badge seed — inserts all 15 catalog badges.
 * Safe to re-run: uses updateOne+upsert so existing badges are not duplicated.
 *
 * Run standalone:
 *   node --import ./src/register-aliases.js src/modules/badge/badge.seed.js
 *
 * Or import and call from your app startup / a dedicated seed script:
 *   import { seedBadges } from "#modules/badge/badge.seed.js";
 *   await seedBadges();
 */

import Badge from "./badge.model.js";

const BADGES = [
  // ── Streak (6) ────────────────────────────────────────────────────────────
  {
    key:         "streak_3",
    name:        "First Flame",
    description: "Maintain a 3-day learning streak.",
    icon:        "🔥",
    category:    "streak",
    rarity:      "common",
    condition:   { type: "streak_current", threshold: 3 },
    sortOrder:   1,
  },
  {
    key:         "streak_7",
    name:        "Week Warrior",
    description: "Maintain a 7-day learning streak.",
    icon:        "⚔️",
    category:    "streak",
    rarity:      "common",
    condition:   { type: "streak_current", threshold: 7 },
    sortOrder:   2,
  },
  {
    key:         "streak_14",
    name:        "Fortnight Force",
    description: "Maintain a 14-day learning streak.",
    icon:        "💪",
    category:    "streak",
    rarity:      "rare",
    condition:   { type: "streak_current", threshold: 14 },
    sortOrder:   3,
  },
  {
    key:         "streak_30",
    name:        "Month Master",
    description: "Maintain a 30-day learning streak.",
    icon:        "🏅",
    category:    "streak",
    rarity:      "rare",
    condition:   { type: "streak_current", threshold: 30 },
    sortOrder:   4,
  },
  {
    key:         "streak_100",
    name:        "Century Scholar",
    description: "Maintain a 100-day learning streak.",
    icon:        "💯",
    category:    "streak",
    rarity:      "epic",
    condition:   { type: "streak_current", threshold: 100 },
    sortOrder:   5,
  },
  {
    key:         "streak_longest_30",
    name:        "Iron Will",
    description: "Achieve a longest-ever streak of 30 days.",
    icon:        "🦾",
    category:    "streak",
    rarity:      "rare",
    condition:   { type: "streak_longest", threshold: 30 },
    sortOrder:   6,
  },

  // ── Completion (5) ────────────────────────────────────────────────────────
  {
    key:         "lecture_first",
    name:        "First Step",
    description: "Complete your first lecture.",
    icon:        "👣",
    category:    "completion",
    rarity:      "common",
    condition:   { type: "lectures_total", threshold: 1 },
    sortOrder:   7,
  },
  {
    key:         "lecture_50",
    name:        "Content Climber",
    description: "Complete 50 lectures across any courses.",
    icon:        "📚",
    category:    "completion",
    rarity:      "rare",
    condition:   { type: "lectures_total", threshold: 50 },
    sortOrder:   8,
  },
  {
    key:         "lecture_200",
    name:        "Lecture Legend",
    description: "Complete 200 lectures across any courses.",
    icon:        "🎓",
    category:    "completion",
    rarity:      "epic",
    condition:   { type: "lectures_total", threshold: 200 },
    sortOrder:   9,
  },
  {
    key:         "course_first",
    name:        "Graduate",
    description: "Complete your first course.",
    icon:        "🎓",
    category:    "completion",
    rarity:      "common",
    condition:   { type: "courses_total", threshold: 1 },
    sortOrder:   10,
  },
  {
    key:         "course_5",
    name:        "Course Collector",
    description: "Complete 5 courses.",
    icon:        "🏆",
    category:    "completion",
    rarity:      "rare",
    condition:   { type: "courses_total", threshold: 5 },
    sortOrder:   11,
  },

  // ── Performance (4) ───────────────────────────────────────────────────────
  {
    key:         "quiz_perfect",
    name:        "Ace",
    description: "Score 100% on any quiz.",
    icon:        "⭐",
    category:    "performance",
    rarity:      "common",
    condition:   { type: "quiz_perfect_count", threshold: 1 },
    sortOrder:   12,
  },
  {
    key:         "quiz_perfect_3",
    name:        "Triple Ace",
    description: "Score 100% on 3 different quizzes.",
    icon:        "🌟",
    category:    "performance",
    rarity:      "rare",
    condition:   { type: "quiz_perfect_count", threshold: 3 },
    sortOrder:   13,
  },
  {
    key:         "course_ai_score_90",
    name:        "AI Approved",
    description: "Earn an AI assessment score of 90 or higher on a completed course.",
    icon:        "🤖",
    category:    "performance",
    rarity:      "epic",
    condition:   { type: "ai_score", threshold: 90 },
    sortOrder:   14,
  },
  {
    key:         "fast_finish",
    name:        "Speed Runner",
    description: "Complete a course within 7 days of starting it.",
    icon:        "⚡",
    category:    "performance",
    rarity:      "rare",
    condition:   { type: "fast_finish", threshold: 7 },
    sortOrder:   15,
  },
];

export async function seedBadges() {
  const ops = BADGES.map((badge) => ({
    updateOne: {
      filter: { key: badge.key },
      update: { $setOnInsert: badge },
      upsert: true,
    },
  }));

  const result = await Badge.bulkWrite(ops, { ordered: false });
  console.log(
    `Badge seed: ${result.upsertedCount} inserted, ${result.matchedCount} already existed.`
  );
  return result;
}
