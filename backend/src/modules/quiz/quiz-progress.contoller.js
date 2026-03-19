import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";
import * as quizService from "./quiz-progress.service.js";

export const saveQuizResult = asyncHandler(async (req, res) => {

  const { courseId, lectureId, score, totalQuestions, wrongAnswers } = req.body;

  const result = await quizService.saveQuizResult(
    req.user.userId,
    courseId,
    lectureId,
    score,
    totalQuestions,
    wrongAnswers
  );

  return sendSuccessResponse(
    res,
    200,
    "Quiz result saved",
    result
  );
});