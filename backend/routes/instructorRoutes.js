import express from 'express';

import { getPublicFields, getPrivateFields, createInstructor, 
    updateInstructor, getInstructorCourses, getMyCourseById 
} from '../controllers/instructorController.js';
import userAuth from '../middlewares/userAuth.js';

const instructorRoute = express.Router();

instructorRoute.get('/instructor/courses/:id', userAuth, getMyCourseById);
instructorRoute.get('/instructor/courses', userAuth, getInstructorCourses);

instructorRoute.get('/instructors/:id', getPublicFields);
instructorRoute.get('/instructor', userAuth, getPrivateFields);
instructorRoute.post('/instructors', userAuth, createInstructor);
instructorRoute.patch('/instructor/:id', userAuth, updateInstructor);


export default instructorRoute;
