import { Router } from "express";
import { checkAuth, protect, restrictTo } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js";
import * as instructorController from "./instructor.controller.js";
import * as instructorSchema from "./instructor.validation.js";

// @route /instructors
const publicRoutes = Router();

publicRoutes.post("/", protect, instructorController.becomeInstructor);
publicRoutes.get("/me", checkAuth, instructorController.getCurrentInstructor);
publicRoutes.get(
  "/:insId",
  validate(instructorSchema.insIdParamRequest),
  instructorController.getPublicProfile
);
publicRoutes.get(
  "/:insId/courses",
  validate(instructorSchema.publicCoursesRequest),
  instructorController.getInstructorPublicCourses
);
publicRoutes.get(
  "/:insId/stats",
  validate(instructorSchema.insIdParamRequest),
  instructorController.getInstructorPublicStats
);

// @route /instructor
const privateRoutes = Router();
privateRoutes.use(protect, restrictTo("instructor"));

privateRoutes.get(
  "/courses",
  validate(instructorSchema.coursesQueryRequest),
  instructorController.getCourses
);
privateRoutes.post("/courses", instructorController.createCourse);
privateRoutes.get("/earning", instructorController.getInstructorEarning);
privateRoutes.get("/profile", instructorController.getProfile);
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
privateRoutes.get("/courses/stats", instructorController.getCoursesStats);
privateRoutes.get(
  "/courses/:courseId",
  validate(instructorSchema.courseIdParamRequest),
  instructorController.getCourseForEdit
);
privateRoutes.patch(
  "/courses/:courseId",
  validate(instructorSchema.updateCourseRequest),
  instructorController.updateCourse
);
privateRoutes.delete(
  "/courses/:courseId/changes",
  validate(instructorSchema.courseIdParamRequest),
  instructorController.clearCourseChanges
);
privateRoutes.get(
  "/courses/:courseId/details",
  validate(instructorSchema.courseIdParamRequest),
  instructorController.getCourseDetails
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
privateRoutes.post(
  "/courses/:courseId/submit",
  validate(instructorSchema.submitCourseRequest),
  instructorController.submitCourse
);
// #TODO: REMOVE!!
privateRoutes.get(
  "/courses/:courseId/approve",
  validate(instructorSchema.courseIdParamRequest),
  instructorController.approveCourse
);

export default { publicRoutes, privateRoutes };