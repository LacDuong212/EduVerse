import { Router } from "express";
import { protect } from "#middlewares/auth.middleware.js";
import * as instructorController from "./instructor.controller.js";

const publicRoutes = Router();
const privateRoutes = Router();

publicRoutes.post("/", protect, instructorController.becomeInstructor);
// publicRoutes.get("/:id", instructorController.getInstructorById);

// privateRoutes.get("/", instructorController.getInstructorDetails);

export default { publicRoutes, privateRoutes };