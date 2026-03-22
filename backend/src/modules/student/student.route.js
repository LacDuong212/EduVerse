import { Router } from "express";
import { protect, restrictTo } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js"
import * as studentController from "./student.controller.js";
import * as studentSchema from "./student.validation.js";

// @route /student
const studentRoute = Router();
studentRoute.use(protect, restrictTo("student"));

studentRoute.patch(
  "/profile",
  validate(studentSchema.updateProfileRequest),
  studentController.updateProfile
);

export default studentRoute;