import { Router } from "express";
import { protect, restrictTo } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js";
import * as instructorController from "./instructor.controller.js";
import * as instructorSchema from "./instructor.validation.js";

// @route /instructors
const publicRoutes = Router();

publicRoutes.post("/", protect, instructorController.becomeInstructor);
publicRoutes.get(
  "/:insId/stats",
  validate(instructorSchema.insIdParamRequest),
  instructorController.getInstructorPublicStats
);

// @route /instructor
const privateRoutes = Router();
privateRoutes.use(protect, restrictTo("instructor"));

privateRoutes.get("/stats", instructorController.getInstructorStats);

export default { publicRoutes, privateRoutes };