import quizProgress from "./quiz-progress.model";

export const saveQuizResult = async (userId, courseId, lectureId, score, totalQuestions, wrongAnswers) => {

  let progress = await QuizProgress.findOne({
    user: userId,
    course: courseId
  });

  if (!progress) {
    progress = new QuizProgress({
      user: userId,
      course: courseId,
      quizzes: []
    });
  }

  progress.quizzes = progress.quizzes.filter(
    q => q.lectureId.toString() !== lectureId
  );

  progress.quizzes.push({
    lectureId,
    score,
    totalQuestions,
    wrongAnswers
  });

  await progress.save();

  return progress;
};