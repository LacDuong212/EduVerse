import AppError from "#exceptions/app.error.js";
import { evaluateAndAward } from "#modules/badge/badge.evaluator.js";
import QuizProgress from "./quiz-progress.model.js";

export const saveQuizResult = async (
  userId,
  courseId,
  lectureId,
  score,
  totalQuestions,
  wrongAnswers = []
) => {
  if (!userId) throw new AppError("User ID is required", 400);
  if (!courseId) throw new AppError("Course ID is required", 400);
  if (!lectureId) throw new AppError("Lecture ID is required", 400);

  const safeScore = Number(score);
  const safeTotal = Number(totalQuestions);

  if (!Number.isFinite(safeScore) || safeScore < 0) {
    throw new AppError("Invalid quiz score", 400);
  }

  if (!Number.isFinite(safeTotal) || safeTotal < 1) {
    throw new AppError("Invalid total questions", 400);
  }

  const progress = await QuizProgress.findOneAndUpdate(
    {
      user: userId,
      course: courseId,
    },
    {
      $pull: {
        quizzes: {
          lectureId,
        },
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  progress.quizzes.push({
    lectureId,
    score: safeScore,
    totalQuestions: safeTotal,
    wrongAnswers: Array.isArray(wrongAnswers) ? wrongAnswers : [],
  });

  await progress.save();

  // Badge evaluation only on a perfect score — avoids the cross-course query on
  // every quiz submission, since only perfect scores can advance badge thresholds.
  const isPerfect = safeScore === safeTotal;
  if (isPerfect) {
    try {
      // Count all-time perfect quizzes for this user across all courses.
      const allProgress = await QuizProgress.find({ user: userId })
        .select("quizzes.score quizzes.totalQuestions")
        .lean();

      const perfectCount = allProgress.reduce(
        (n, p) =>
          n +
          p.quizzes.filter(
            (q) => q.score === q.totalQuestions && q.totalQuestions > 0
          ).length,
        0
      );

      await evaluateAndAward(userId, "quiz_submitted", { perfectQuizCount: perfectCount });
    } catch { /* badge failure must not affect quiz result save */ }
  }

  return progress;
};