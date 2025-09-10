import express from 'express';
import userAuth from '../middlewares/userAuth.js';
import { getProfile, updateProfile, deleteAccount, uploadUserAvatar, getUserData } from '../controllers/userController.js';
import multer from 'multer';


const upload = multer({ dest: "tmp/" }); // temp storage

const userRouter = express.Router();
userRouter.get('/profile', userAuth, getProfile);
userRouter.patch('/profile', userAuth, updateProfile);
userRouter.delete('/profile', userAuth, deleteAccount);
userRouter.post('/avatar', userAuth, upload.single("avatar"), uploadUserAvatar);

userRouter.get('/data', userAuth, getUserData);

export default userRouter;