import express from 'express';
import { adminAuth } from "../middlewares/adminAuth.js";
import {
    getAllInstructors,
    blockInstructor, unblockInstructor,
    getInstructorRequests,
    approveInstructor, rejectInstructor
} from '../controllers/instructorController.js';


const instructorRoute = express.Router();

instructorRoute.get("/", adminAuth, getAllInstructors);
instructorRoute.get("/requests", adminAuth, getInstructorRequests);

instructorRoute.patch("/:id/block", adminAuth, blockInstructor);
instructorRoute.patch("/:id/unblock", adminAuth, unblockInstructor);
instructorRoute.patch("/:id/approve", adminAuth, approveInstructor);
instructorRoute.delete("/:id/reject", adminAuth, rejectInstructor);

export default instructorRoute;