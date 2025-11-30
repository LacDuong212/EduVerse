import express from 'express';
import { getProfile, updateProfile, deleteAccount, 
    getUserData, generateAvatarUploadSignature
} from '../controllers/userController.js';
import userAuth from '../middlewares/userAuth.js';


const userRoute = express.Router();

userRoute.get('/avatar/upload', userAuth, generateAvatarUploadSignature);
userRoute.get('/data', userAuth, getUserData);
userRoute.get('/profile', userAuth, getProfile);

userRoute.patch('/profile', userAuth, updateProfile);

userRoute.delete('/profile', userAuth, deleteAccount);

export default userRoute;