import express from 'express';
import userAuth from '../middlewares/userAuth.js';
import { getProfile, updateProfile, deleteAccount, getUserData } from '../controllers/userController.js';

const userRoute = express.Router();
userRoute.get('/profile', userAuth, getProfile);
userRoute.patch('/profile', userAuth, updateProfile);
userRoute.delete('/profile', userAuth, deleteAccount);

userRoute.get('/data', userAuth, getUserData);


export default userRoute;