import express from 'express';
import { isAuthenticated, register, login, logout,
    verifyOtp,forgotPassword, resetPassword, 
    checkResetOtp} from '../controllers/authController.js';
import userAuth from '../middlewares/userAuth.js';

const authRoute = express.Router();

authRoute.post('/register', register);
authRoute.post('/login', login);
authRoute.post('/logout', logout);
authRoute.get('/is-auth', userAuth, isAuthenticated);
authRoute.post('/verify-otp', verifyOtp);
authRoute.post('/forgot-password', forgotPassword);
authRoute.post("/check-reset-otp", checkResetOtp); 
authRoute.post("/reset-password", resetPassword);

export default authRoute;