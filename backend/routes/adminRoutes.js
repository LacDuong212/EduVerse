import express from 'express';
import { register, login, logout,
    forgotPassword, resetPassword, 
    verifyAccount, verifyOtpCheck,
    getAdminProfile, getAllAdministrators } from '../controllers/adminController.js';
import { getAllStudents, blockStudent, unblockStudent, deleteStudent } from '../controllers/userController.js';
import { getAllInstructors, blockInstructor, unblockInstructor } from '../controllers/instructorController.js';
import { getEarningsHistory, getEarningsStats } from '../controllers/courseController.js';
import { verifyAdminToken } from "../middlewares/adminAuth.js";

const adminRoute = express.Router();

adminRoute.post('/register', register);
adminRoute.post('/login', login);
adminRoute.post('/logout', logout);
adminRoute.post('/verify-otp', verifyOtpCheck);
adminRoute.post('/verify-account', verifyAccount); 
adminRoute.post('/forgot-password', forgotPassword);
adminRoute.post('/reset-password', resetPassword);
adminRoute.get("/profile", verifyAdminToken, getAdminProfile);
adminRoute.get("/admins", verifyAdminToken, getAllAdministrators);

//Admin manage students
adminRoute.get("/students", verifyAdminToken, getAllStudents);
adminRoute.patch("/students/:id/block", verifyAdminToken, blockStudent);
adminRoute.patch("/students/:id/unblock", verifyAdminToken, unblockStudent);
adminRoute.delete("/students/:id", verifyAdminToken, deleteStudent);

//Admin manage instructors
adminRoute.get("/instructors", verifyAdminToken, getAllInstructors);
adminRoute.patch("/instructors/:id/block", verifyAdminToken, blockInstructor);
adminRoute.patch("/instructors/:id/unblock", verifyAdminToken, unblockInstructor);

//Admin manage earning
adminRoute.get("/earnings-history", verifyAdminToken, getEarningsHistory);
adminRoute.get("/earnings-stats", verifyAdminToken, getEarningsStats);

export default adminRoute;