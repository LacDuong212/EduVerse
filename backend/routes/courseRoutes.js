import express from "express";
import { getAllCourses, getCourseFilters, getCourseById, 
    courseViewed, getViewedCourses, getHomeCourses, getOwnedCourses, getRelatedCourses,
    createCourse, updateCourse, setCoursePrivacy,
    streamVideo, generateImageUploadSignature
} from "../controllers/courseController.js";
import { processLectureAI } from "../controllers/aiController.js";
import userAuth from "../middlewares/userAuth.js";
import {
  getCourseProgress,
  updateLectureProgress,
} from "../controllers/learningController.js";
const courseRoute = express.Router();

courseRoute.get("/home", getHomeCourses);
courseRoute.get("/", getAllCourses);
courseRoute.get("/filters", getCourseFilters);
courseRoute.get("/my-courses", userAuth, getOwnedCourses);
courseRoute.get("/viewed", userAuth, getViewedCourses);
courseRoute.get("/:id/images/upload", userAuth, generateImageUploadSignature);
courseRoute.get("/:id/related", getRelatedCourses);
courseRoute.get("/:id/videos/:key", userAuth, streamVideo);
courseRoute.get("/:id", getCourseById);

courseRoute.post("/:id/viewed", userAuth, courseViewed);
courseRoute.post("/", userAuth, createCourse);

courseRoute.post("/generate-ai", userAuth, processLectureAI);

courseRoute.put("/:id", userAuth, updateCourse);
courseRoute.patch("/:id", userAuth, setCoursePrivacy);

courseRoute.get("/:courseId/progress", userAuth, getCourseProgress);
courseRoute.post("/:courseId/progress/lectures/:lectureId", userAuth, updateLectureProgress);

export default courseRoute;