import { Router } from "express";
import { checkAuth, protect, restrictTo } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js"
import * as courseController from "./course.controller.js";
import * as courseSchema from "./course.validation.js";

// @route /courses
const courseRoute = Router();

courseRoute.get("/", validate(courseSchema.courseQuerySchema), courseController.getAllCourses);
courseRoute.get("/home", courseController.getHomeCourses);
courseRoute.get("/stats", courseController.getCourseStats);
courseRoute.get(
  "/:id", 
  checkAuth, 
  validate(courseSchema.idParamSchema), 
  courseController.getCourseDetailsById
);
courseRoute.get(
  "/:id/reviews", 
  checkAuth,
  validate(courseSchema.idParamSchema), 
  courseController.getCourseReviewsById
);
courseRoute.get(
  "/:id/image/upload", 
  protect, 
  restrictTo("instructor"), 
  validate(courseSchema.idParamSchema),
  courseController.getImageParams
);

export default courseRoute;