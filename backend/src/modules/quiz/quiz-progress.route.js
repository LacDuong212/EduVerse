import { Router } from "express";
import { protect, restrictTo } from "#middlewares/auth.middleware.js";
import * as quizController from "./quizProgress.controller.js";

const router = Router();

router.use(protect, restrictTo("student"));

router.post("/", quizController.saveQuizResult);

export default router;