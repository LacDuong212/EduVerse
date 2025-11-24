import express from 'express';

import { getPublicFields, getPrivateFields, createInstructor, 
    updateInstructor, getInstructorCourses, getMyCourseById, 
    getCourseEarnings, getStudentsEnrolled, getCourseStudentsAndReviews, 
    getDashboardData
} from '../controllers/instructorController.js';
import userAuth from '../middlewares/userAuth.js';

const instructorRoute = express.Router();

instructorRoute.get('/instructors/:id', getPublicFields);

instructorRoute.get('/instructor/courses/:id/students', userAuth, getCourseStudentsAndReviews);
instructorRoute.get('/instructor/courses/:id/earnings', userAuth, getCourseEarnings);
instructorRoute.get('/instructor/courses/:id/enrollments', userAuth, getStudentsEnrolled);
instructorRoute.get('/instructor/courses/:id', userAuth, getMyCourseById);
instructorRoute.get('/instructor/courses', userAuth, getInstructorCourses);
instructorRoute.get('/instructor/dashboard', userAuth, getDashboardData);
instructorRoute.get('/instructor', userAuth, getPrivateFields);
instructorRoute.post('/instructors', userAuth, createInstructor);
instructorRoute.patch('/instructor/:id', userAuth, updateInstructor);


export default instructorRoute;
