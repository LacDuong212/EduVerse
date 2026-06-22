/**
 * Retroactive badge evaluation.
 * Awards badges to all students based on their current persisted stats.
 * Safe to call multiple times — DB unique index silently drops duplicates.
 *
 * Skips ai_score and fast_finish (require live event data captured at the time
 * of the event; they are awarded going forward via real-time hooks).
 */

import Student from "#modules/student/student.model.js";
import Streak from "#modules/streak/streak.model.js";
import QuizProgress from "#modules/quiz/quiz-progress.model.js";
import { evaluateAndAward } from "#modules/badge/badge.evaluator.js";
import logger from "#utils/logger.js";

const BATCH_SIZE = 50;

export async function runRetroactiveBadges({ dryRun = false } = {}) {
  const students = await Student.find({}).select("user stats").lean();
  logger.debug(`[badge-retro] ${students.length} students to process | dry-run=${dryRun}`);

  let totalAwarded = 0;

  for (let i = 0; i < students.length; i += BATCH_SIZE) {
    const batch = students.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (student) => {
        const userId = student.user.toString();

        const [streak, allQuizProgress] = await Promise.all([
          Streak.findOne({ user: student.user }).lean(),
          QuizProgress.find({ user: student.user }).select("quizzes").lean(),
        ]);

        const perfectCount = allQuizProgress.reduce(
          (n, p) =>
            n + p.quizzes.filter((q) => q.score === q.totalQuestions && q.totalQuestions > 0).length,
          0
        );

        const contexts = {
          streak_updated: { streakCurrent: streak?.currentStreak ?? 0, streakLongest: streak?.longestStreak ?? 0 },
          lecture_completed: { lecturesTotal: student.stats?.completedLectures ?? 0 },
          course_completed: { coursesTotal: student.stats?.completedCourses ?? 0, aiScore: null, daysSinceFirstLecture: null },
          quiz_submitted: { perfectQuizCount: perfectCount },
        };

        if (dryRun) {
          logger.debug(
            `[badge-retro][DRY] ${userId} | streak=${contexts.streak_updated.streakCurrent}` +
            ` lectures=${contexts.lecture_completed.lecturesTotal}` +
            ` courses=${contexts.course_completed.coursesTotal}` +
            ` perfectQuizzes=${perfectCount}`
          );
          return;
        }

        const results = await Promise.all([
          evaluateAndAward(userId, "streak_updated", contexts.streak_updated),
          evaluateAndAward(userId, "lecture_completed", contexts.lecture_completed),
          evaluateAndAward(userId, "course_completed", contexts.course_completed),
          evaluateAndAward(userId, "quiz_submitted", contexts.quiz_submitted),
        ]);

        const awarded = results.flat();
        if (awarded.length > 0) {
          totalAwarded += awarded.length;
          logger.debug(`[badge-retro][+] ${userId} → ${awarded.map((b) => b.name).join(", ")}`);
        }
      })
    );

    // Yield between batches to avoid blocking the event loop
    await new Promise((resolve) => setImmediate(resolve));
  }

  logger.debug(`[badge-retro] Done. Total badges awarded: ${totalAwarded}`);
  return totalAwarded;
}
