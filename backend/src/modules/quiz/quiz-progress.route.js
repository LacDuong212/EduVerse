import { Router } from "express";
import { protect, restrictTo } from "#middlewares/auth.middleware.js";
import * as quizController from "./quiz-progress.controller.js";

// @route /quizzes
const quizRoute = Router();

quizRoute.use(protect, restrictTo("student"));

quizRoute.post("/", quizController.saveQuizResult);

export default quizRoute;