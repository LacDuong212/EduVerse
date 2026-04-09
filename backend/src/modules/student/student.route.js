import { Router } from "express";
import { protect, restrictTo } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js"
import * as studentController from "./student.controller.js";
import * as studentSchema from "./student.validation.js";

// @route /student
const studentRoute = Router();
studentRoute.use(protect, restrictTo("student"));

studentRoute.get(
  "/courses",
  validate(studentSchema.coursesQueryRequest),
  studentController.getEnrolledCourses
);
studentRoute.put(
  "/interests",
  validate(studentSchema.updateInterestsRequest),
  studentController.updateInterests
);
studentRoute.get("/profile", studentController.getProfile);
studentRoute.patch(
  "/profile",
  validate(studentSchema.updateProfileRequest),
  studentController.updateProfile
);
studentRoute.get("/skill-radar", studentController.getMySkillRadar);
studentRoute.get("/stats", studentController.getStats);
studentRoute.get("/streak", studentController.getMyStreak);
studentRoute.post("/streak", studentController.updateMyStreak);
studentRoute.get("/courses/stats", studentController.getCoursesStats);
studentRoute.get(
  "/courses/:courseId/progress",
  validate(studentSchema.courseIdParam),
  studentController.getCourseLearningProgress
);
studentRoute.post(
  "/courses/:courseId/lectures/:lecId/progress",
  validate(studentSchema.updateLectureProgressRequest),
  studentController.updateLectureProgress
);

export default studentRoute;