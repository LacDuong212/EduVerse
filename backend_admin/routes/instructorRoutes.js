import express from "express";
import { adminAuth } from "../middlewares/adminAuth.js";
import {
  getAllInstructors,
  blockInstructor,
  unblockInstructor,
  getInstructorRequests,
  approveInstructor,
  rejectInstructor,
  getInstructorDetail,
  getInstructorDetailStats,
  getInstructorCourses,
  getInstructorStatsById,
} from "../controllers/instructorController.js";

const instructorRoute = express.Router();

instructorRoute.get("/", adminAuth, getAllInstructors);
instructorRoute.get("/requests", adminAuth, getInstructorRequests);
instructorRoute.get("/:id/profile", adminAuth, getInstructorDetail);
instructorRoute.get("/:id/stats", adminAuth, getInstructorDetailStats);
instructorRoute.get("/:id/courses", adminAuth, getInstructorCourses);

instructorRoute.get("/:id/stats", adminAuth, getInstructorStatsById);

instructorRoute.patch("/:id/block", adminAuth, blockInstructor);
instructorRoute.patch("/:id/unblock", adminAuth, unblockInstructor);
instructorRoute.patch("/:id/approve", adminAuth, approveInstructor);
instructorRoute.delete("/:id/reject", adminAuth, rejectInstructor);

export default instructorRoute;