import express from 'express';
import userAuth from '../middlewares/userAuth.js';
import { getProfile, updateProfile, deleteAccount } from '../controllers/userController.js';

const userRouter = express.Router();
userRouter.get('/profile', userAuth, getProfile);
userRouter.patch('/profile', userAuth, updateProfile);
userRouter.delete('/profile', userAuth, deleteAccount);

export default userRouter;