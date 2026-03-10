import { Router } from "express";
import { checkAuth } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js"
import courseController from "./course.controller.js";
import * as courseSchema from "./course.validation.js";

// @route /courses
const courseRoute = Router();

courseRoute.get("/", validate(courseSchema.courseQuerySchema), courseController.getAllCourses);
courseRoute.get("/home", courseController.getHomeCourses);
courseRoute.get("/stats", courseController.getCourseStats);
courseRoute.get("/:id", checkAuth, courseController.getCourseDetailsById);

export default courseRoute;