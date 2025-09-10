import express from "express";
import { getCourseById, getHomeCourses, getAllCourses } from "../controllers/courseController.js";

const courseRouter = express.Router();

courseRouter.get("/home", getHomeCourses);
courseRouter.get("/:id", getCourseById);
courseRouter.get("/", getAllCourses);

export default courseRouter;
