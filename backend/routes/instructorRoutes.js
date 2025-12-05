import express from 'express';

import { getPublicFields, getPrivateFields, createInstructor, 
    getInstructorCourses, getMyCourseById, 
    getCourseEarnings, getStudentsEnrolled, getCourseStudentsAndReviews, 
    getInstructorCounters, getDashboardData, generateVideoUploadUrl,
    getProfile, updateProfile
} from '../controllers/instructorController.js';
import userAuth from '../middlewares/userAuth.js';

const instructorRoute = express.Router();

instructorRoute.get('/instructors/:id', getPublicFields);

instructorRoute.get('/instructor/courses/:id/earnings', userAuth, getCourseEarnings);
instructorRoute.get('/instructor/courses/:id/enrollments', userAuth, getStudentsEnrolled);
instructorRoute.get('/instructor/courses/:id/students', userAuth, getCourseStudentsAndReviews);
instructorRoute.get('/instructor/courses/:id', userAuth, getMyCourseById);
instructorRoute.get('/instructor/courses', userAuth, getInstructorCourses);
instructorRoute.get('/instructor/counters', userAuth, getInstructorCounters);
instructorRoute.get('/instructor/dashboard', userAuth, getDashboardData);
instructorRoute.get('/instructor/profile', userAuth, getProfile);
instructorRoute.get('/instructor', userAuth, getPrivateFields);

instructorRoute.post('/instructor/videos/upload', userAuth, generateVideoUploadUrl);
instructorRoute.post('/instructors', userAuth, createInstructor);

instructorRoute.put('/instructor/profile', userAuth, updateProfile);


export default instructorRoute;
