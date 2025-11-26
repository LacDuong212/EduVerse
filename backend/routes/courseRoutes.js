import express from "express";
import { getFullCourses, getAllCourses, getCourseFilters, getCourseById, 
    courseViewed, getViewedCourses, getHomeCourses, getOwnedCourses, getRelatedCourses, getCoursesOverview, 
    createCourse, updateCourse, updateCourseStatus, setCoursePrivacy ,
    streamVideo
} from "../controllers/courseController.js";
import userAuth from "../middlewares/userAuth.js";
import { verifyAdminToken } from "../middlewares/adminAuth.js";

const courseRoute = express.Router();

courseRoute.get("/home", getHomeCourses);
// courseRoute.get("/full", getFullCourses);
courseRoute.get("/", getAllCourses);
courseRoute.get("/filters", getCourseFilters);
courseRoute.get("/overview", userAuth, getCoursesOverview);
courseRoute.get("/my-courses", userAuth, getOwnedCourses);
courseRoute.get("/viewed", userAuth, getViewedCourses);
courseRoute.get("/:id/related", getRelatedCourses);
courseRoute.get("/:id/videos/:key", userAuth, streamVideo);
courseRoute.get("/:id", getCourseById);

courseRoute.post("/:id/viewed", userAuth, courseViewed);
courseRoute.post("/", userAuth, createCourse);

courseRoute.put("/:id", userAuth, updateCourse);
courseRoute.patch("/:id", userAuth, setCoursePrivacy);
courseRoute.patch("/:id", verifyAdminToken, updateCourseStatus);

export default courseRoute;