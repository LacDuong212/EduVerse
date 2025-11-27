import express from 'express';
import { adminAuth } from "../middlewares/adminAuth.js";
import { getAllStudents, 
    blockStudent, unblockStudent,
    deleteStudent
} from '../controllers/studentController.js';


const studentRoute = express.Router();

studentRoute.get("/", adminAuth, getAllStudents);
studentRoute.patch("/:id/block", adminAuth, blockStudent);
studentRoute.patch("/:id/unblock", adminAuth, unblockStudent);
studentRoute.delete("/:id", adminAuth, deleteStudent);

export default studentRoute;
