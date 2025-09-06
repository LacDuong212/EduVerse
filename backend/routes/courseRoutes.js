import express from "express";
import { getAllCourses, getHomeCourses } from "../controllers/courseController.js";

const router = express.Router();

router.get("/home", getHomeCourses);
router.get("/", getAllCourses);

export default router;