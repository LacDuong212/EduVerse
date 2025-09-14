import express from "express";
import { getAllCourses, getCourseById, getHomeCourses, getOwnedCourses } from "../controllers/courseController.js";
import userAuth from "../middlewares/userAuth.js";

const courseRoute = express.Router();

courseRoute.get("/home", getHomeCourses);
courseRoute.get("/", getAllCourses);
courseRoute.get("/my-courses", userAuth, getOwnedCourses);
courseRoute.get("/:id", getCourseById);

export default courseRoute;