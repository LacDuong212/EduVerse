import AppError from "#exceptions/app.error.js";
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

  return progress;
};