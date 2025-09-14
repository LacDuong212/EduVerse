import express from "express";
import { getAllCourses, getCourseById, getHomeCourses } from "../controllers/courseController.js";

const courseRoute = express.Router();

courseRoute.get("/home", getHomeCourses);
courseRoute.get("/", getAllCourses);
courseRoute.get("/:id", getCourseById);

export default courseRoute;