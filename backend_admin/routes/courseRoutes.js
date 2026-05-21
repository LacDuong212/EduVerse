import express from 'express';
import { adminAuth } from "../middlewares/adminAuth.js";
import * as courseCtrl from "../controllers/courseController.js";


const courseRoute = express.Router();
courseRoute.use(adminAuth);

courseRoute.get("/overview", courseCtrl.getCoursesOverview);
courseRoute.post("/:id/status", courseCtrl.updateCourseStatus);
courseRoute.delete("/:id", courseCtrl.softDeleteCourse);
courseRoute.patch("/:id/restore", courseCtrl.restoreCourse);
courseRoute.patch("/:id/unblock", courseCtrl.unblockCourse);
courseRoute.patch("/:id/approve", courseCtrl.approveCourse);

export default courseRoute;