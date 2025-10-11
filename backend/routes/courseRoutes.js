import express from "express";
import { getAllCourses, getCourseById, courseViewed, getViewedCourses, getHomeCourses, getOwnedCourses } from "../controllers/courseController.js";
import userAuth from "../middlewares/userAuth.js";

const courseRoute = express.Router();

courseRoute.get("/home", getHomeCourses);
courseRoute.get("/", getAllCourses);
courseRoute.get("/my-courses", userAuth, getOwnedCourses);
courseRoute.get("/viewed", userAuth, getViewedCourses);
courseRoute.get("/:id", getCourseById);
courseRoute.post("/:id/viewed", userAuth, courseViewed);

export default courseRoute;