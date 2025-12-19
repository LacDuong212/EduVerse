import QuizProgress from "../models/quizProgressModel.js";

export const saveQuizResult = async (req, res) => {
  const { courseId, lectureId, score, totalQuestions, wrongAnswers } = req.body;
  const userId = req.userId;

  try {
    let progress = await QuizProgress.findOne({ userId, courseId });
    if (!progress) progress = new QuizProgress({ userId, courseId, quizzes: [] });

    progress.quizzes = progress.quizzes.filter(q => q.lectureId.toString() !== lectureId);

    progress.quizzes.push({
      lectureId,
      score,
      totalQuestions,
      wrongAnswers
    });

    await progress.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};