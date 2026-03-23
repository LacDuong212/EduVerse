import { Router } from "express";
import { protect, restrictTo } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js";
import * as instructorController from "./instructor.controller.js";
import * as instructorSchema from "./instructor.validation.js";

// @route /instructors
const publicRoutes = Router();

publicRoutes.post("/", protect, instructorController.becomeInstructor);
publicRoutes.get(
  "/:insId",
  validate(instructorSchema.insIdParamRequest),
  instructorController.getPublicProfile
);
publicRoutes.get(
  "/:insId/stats",
  validate(instructorSchema.insIdParamRequest),
  instructorController.getInstructorPublicStats
);

// @route /instructor
const privateRoutes = Router();
privateRoutes.use(protect, restrictTo("instructor"));

privateRoutes.patch(
  "/profile",
  validate(instructorSchema.updateProfileRequest),
  instructorController.updateProfile
);
privateRoutes.get("/stats", instructorController.getInstructorStats);
privateRoutes.get(
  "/students",
  validate(instructorSchema.studentsQueryRequest),
  instructorController.getStudents
);
privateRoutes.get("/courses/earning", instructorController.getCoursesMonthlyEarning);
privateRoutes.get(
  "/courses/top-courses",
  validate(instructorSchema.limitQueryRequest),
  instructorController.getTopEarningCourses
);
privateRoutes.get(
  "/courses/:courseId/earning",
  validate(instructorSchema.courseIdParamRequest),
  instructorController.getCourseMonthlyEarning
);
privateRoutes.get(
  "/courses/:courseId/enrollments",
  validate(instructorSchema.courseIdParamRequest),
  instructorController.getCourseMonthlyEnrollments
);

export default { publicRoutes, privateRoutes };