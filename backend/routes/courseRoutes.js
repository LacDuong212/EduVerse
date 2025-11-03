import express from "express";
import { getFullCourses, getAllCourses, getCourseById, 
    courseViewed, getViewedCourses, getHomeCourses, getOwnedCourses, getRelatedCourses, 
    saveCourseStep1, saveCourseStep2, saveCourseStep3, submitCourseForReview, 
    getCoursesOverview, updateCourseStatus } from "../controllers/courseController.js";
import userAuth from "../middlewares/userAuth.js";
import { verifyAdminToken } from "../middlewares/adminAuth.js";

const courseRoute = express.Router();

courseRoute.get("/home", getHomeCourses);
courseRoute.get("/full", getFullCourses);
courseRoute.get("/", getAllCourses);
courseRoute.get("/overview", userAuth, getCoursesOverview);
courseRoute.get("/my-courses", userAuth, getOwnedCourses);
courseRoute.get("/viewed", userAuth, getViewedCourses);
courseRoute.get("/:id/related", getRelatedCourses);
courseRoute.get("/:id", getCourseById);

courseRoute.post("/:id/viewed", userAuth, courseViewed);
courseRoute.post("/save-step1", userAuth, saveCourseStep1);
courseRoute.post("/save-step2", userAuth, saveCourseStep2);
courseRoute.post("/save-step3", userAuth, saveCourseStep3);
courseRoute.post("/submit", userAuth, submitCourseForReview);

courseRoute.patch("/:id", verifyAdminToken, updateCourseStatus);

export default courseRoute;