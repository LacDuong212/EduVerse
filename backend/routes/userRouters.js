import express from 'express';
import userAuth from '../middlewares/userAuth.js';
import { getProfile, updateProfile, deleteAccount, getUserData } from '../controllers/userController.js';

const userRouter = express.Router();
userRouter.get('/profile', userAuth, getProfile);
userRouter.patch('/profile', userAuth, updateProfile);
userRouter.delete('/profile', userAuth, deleteAccount);

userRouter.get('/data', userAuth, getUserData);


export default userRouter;