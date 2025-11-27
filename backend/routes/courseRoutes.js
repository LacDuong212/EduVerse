import express from "express";
import { getAllCourses, getCourseFilters, getCourseById, 
    courseViewed, getViewedCourses, getHomeCourses, getOwnedCourses, getRelatedCourses,
    createCourse, updateCourse, setCoursePrivacy } from "../controllers/courseController.js";
import userAuth from "../middlewares/userAuth.js";

const courseRoute = express.Router();

courseRoute.get("/home", getHomeCourses);
// courseRoute.get("/full", getFullCourses);
courseRoute.get("/", getAllCourses);
courseRoute.get("/filters", getCourseFilters);
courseRoute.get("/my-courses", userAuth, getOwnedCourses);
courseRoute.get("/viewed", userAuth, getViewedCourses);
courseRoute.get("/:id/related", getRelatedCourses);
courseRoute.get("/:id", getCourseById);

courseRoute.post("/:id/viewed", userAuth, courseViewed);
courseRoute.post("/", userAuth, createCourse);

courseRoute.put("/:id", userAuth, updateCourse);
courseRoute.patch("/:id", userAuth, setCoursePrivacy);

export default courseRoute;