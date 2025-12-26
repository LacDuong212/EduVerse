import express from "express";
import { getMyCourses, getMyCourseById, isMyCourseById } from "../controllers/studentController.js";
import userAuth from "../middlewares/userAuth.js"; // chính middleware bạn gửi ở trên
import { getMyStreak } from "../controllers/streakController.js";
import { getSkillRadar } from "../controllers/studentSkillController.js";

const router = express.Router();

router.get("/my-courses", userAuth, getMyCourses);
router.get("/my-courses/:courseId", userAuth, getMyCourseById);
router.get("/my-courses/check/:courseId", userAuth, isMyCourseById);
router.get("/streak", userAuth, getMyStreak);
router.get("/skill-radar", userAuth, getSkillRadar);

export default router;