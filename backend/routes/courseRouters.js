import express from "express";
import { getCourseById } from "../controllers/courseController.js";

const courseRouter = express.Router();

courseRouter.get("/:id", getCourseById);

export default courseRouter;
