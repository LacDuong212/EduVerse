import express from 'express';
import { isAuthenticated, register, login, logout,
    verifyOtp, } from '../controllers/authController.js';
import userAuth from '../middlewares/userAuth.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/is-auth', userAuth, isAuthenticated);
authRouter.post('/verify-otp', verifyOtp);

export default authRouter;