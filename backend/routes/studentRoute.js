import express from "express";
import { getMyCourses, getMyCourseById } from "../controllers/studentController.js";
import userAuth from "../middlewares/userAuth.js"; // chính middleware bạn gửi ở trên
import { getMyStreak } from "../controllers/streakController.js";
const router = express.Router();

// ✅ Chỉ student đã đăng nhập mới lấy được courses của mình
router.get("/my-courses", userAuth, getMyCourses);
router.get("/my-courses/:courseId", userAuth, getMyCourseById);
router.get("/streak", userAuth, getMyStreak);
export default router;