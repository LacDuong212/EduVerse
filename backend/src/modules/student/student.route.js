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

export default studentRoute;