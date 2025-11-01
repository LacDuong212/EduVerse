import express from 'express';

import { getPublicFields, getPrivateFields, createInstructor, updateInstructor } from '../controllers/instructorController.js';
import userAuth from '../middlewares/userAuth.js';

const instructorRoute = express.Router();

instructorRoute.get('/instructors/:id', getPublicFields);
instructorRoute.get('/instructor/:id', userAuth, getPrivateFields);
instructorRoute.post('/instructors', userAuth, createInstructor);
instructorRoute.patch('/instructor/:id', userAuth, updateInstructor);

export default instructorRoute;
