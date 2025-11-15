import express from "express";
import { getMyCourses } from "../controllers/studentController.js";
import userAuth from "../middlewares/userAuth.js"; // chính middleware bạn gửi ở trên

const router = express.Router();

// ✅ Chỉ student đã đăng nhập mới lấy được courses của mình
router.get("/my-courses", userAuth, getMyCourses);

export default router;