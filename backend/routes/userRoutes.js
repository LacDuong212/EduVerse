import express from 'express';
import { getProfile, updateProfile, deleteAccount, 
    getUserData, generateAvatarUploadSignature,
    changePassword, updateInterests
} from '../controllers/userController.js';
import userAuth from '../middlewares/userAuth.js';


const userRoute = express.Router();

userRoute.put('/interests', userAuth, updateInterests);

userRoute.get('/avatar/upload', userAuth, generateAvatarUploadSignature);
userRoute.get('/data', userAuth, getUserData);
userRoute.get('/profile', userAuth, getProfile);


userRoute.patch('/profile', userAuth, updateProfile);
userRoute.patch('/change-password', userAuth, changePassword);

userRoute.delete('/profile', userAuth, deleteAccount);

export default userRoute;