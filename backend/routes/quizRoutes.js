import express from "express";
import userAuth from "../middlewares/userAuth.js";
import { saveQuizResult } from "../controllers/quizController.js";

const quizRoute = express.Router();

quizRoute.use(userAuth);

quizRoute.post("/save", saveQuizResult);

export default quizRoute;