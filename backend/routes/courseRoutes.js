import express from "express";
import { getAllCourses, getHomeCourses } from "../controllers/courseController.js";

const courseRoute = express.Router();

courseRoute.get("/home", getHomeCourses);
courseRoute.get("/", getAllCourses);

export default courseRoute;