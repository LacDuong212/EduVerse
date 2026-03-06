import { Router } from "express";
import validate from "#middlewares/zodValidator.middleware.js"
import * as courseController from "./course.controller.js";
import * as courseSchema from "./course.validation.js";

const courseRoute = Router();

courseRoute.get("/", validate(courseSchema.courseQuerySchema), courseController.getAllCourses);
courseRoute.get("/home", courseController.getHomeCourses);
courseRoute.get("/stats", courseController.getCourseStats);

export default courseRoute;