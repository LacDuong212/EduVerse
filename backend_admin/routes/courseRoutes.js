import express from 'express';
import { adminAuth } from "../middlewares/adminAuth.js";
import {
    getCoursesOverview,
    updateCourseStatus
} from "../controllers/courseController.js";


const courseRoute = express.Router();

courseRoute.get("/overview", adminAuth, getCoursesOverview);
courseRoute.patch("/:id", adminAuth, updateCourseStatus);

export default courseRoute;