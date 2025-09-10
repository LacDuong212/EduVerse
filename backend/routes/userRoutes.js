import express from 'express';
import userAuth from '../middlewares/userAuth.js';
import { getProfile, updateProfile, deleteAccount, getUserData, uploadUserAvatar } from '../controllers/userController.js';
import multer from 'multer';

const upload = multer({ dest: "tmp/" });

const userRoute = express.Router();
userRoute.get('/profile', userAuth, getProfile);
userRoute.patch('/profile', userAuth, updateProfile);
userRoute.delete('/profile', userAuth, deleteAccount);
userRoute.post('/avatar', userAuth, upload.single("avatar"), uploadUserAvatar);

userRoute.get('/data', userAuth, getUserData);

export default userRoute;