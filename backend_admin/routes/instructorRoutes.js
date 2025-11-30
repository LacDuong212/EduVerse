import express from 'express';
import { adminAuth } from "../middlewares/adminAuth.js";
import {
    getAllInstructors,
    blockInstructor, unblockInstructor
} from '../controllers/instructorController.js';


const instructorRoute = express.Router();

instructorRoute.get("/", adminAuth, getAllInstructors);
instructorRoute.patch("/:id/block", adminAuth, blockInstructor);
instructorRoute.patch("/:id/unblock", adminAuth, unblockInstructor);

export default instructorRoute;