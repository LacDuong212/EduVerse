import { Router } from "express";
import { protect, restrictTo } from "#middlewares/auth.middleware.js";
import instructorController from "./instructor.controller.js";

// @route /instructors
const publicRoutes = Router();
// @route /instructor
const privateRoutes = Router();

publicRoutes.post("/", protect, instructorController.becomeInstructor);
publicRoutes.get("/:insId/stats", instructorController.getInstructorPublicStats);

privateRoutes.get("/stats", protect, restrictTo("instructor"), instructorController.getInstructorStats);

export default { publicRoutes, privateRoutes };