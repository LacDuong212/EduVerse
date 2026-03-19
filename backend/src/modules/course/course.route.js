import { Router } from "express";
import { checkAuth, protect, restrictTo } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js"
import * as courseController from "./course.controller.js";
import * as courseSchema from "./course.validation.js";

// @route /courses
const courseRoute = Router();

courseRoute.get("/", validate(courseSchema.courseQueryRequest), courseController.getAllCourses);
courseRoute.get("/home", courseController.getHomeCourses);
courseRoute.get("/recommendations", checkAuth, courseController.getRecommendedCourses);
courseRoute.get("/stats", courseController.getCourseStats);
courseRoute.get(
  "/:id",
  checkAuth,
  validate(courseSchema.idParamRequest),
  courseController.getCourseDetailsById
);
courseRoute.get(
  "/:id/curriculum",
  checkAuth,
  validate(courseSchema.idParamRequest),
  courseController.getCourseCurriculum
);
courseRoute.get(
  "/:id/related",
  validate(courseSchema.idParamRequest),
  courseController.getRelatedCourses
);
courseRoute.get(
  "/:id/reviews",
  checkAuth,
  validate(courseSchema.idParamRequest),
  courseController.getCourseReviewsById
);
courseRoute.get(
  "/:id/image/upload",
  protect,
  restrictTo("instructor"),
  validate(courseSchema.idParamRequest),
  courseController.getImageParams
);

export default courseRoute;