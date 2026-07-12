import express from 'express';
import {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    isAuthenticated
} from '../controllers/authController.js';

import {
    loginSchema,
    registerSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyEmailSchema
} from '../validations/auth.validation.js';

import validate from '../middlewares/validate.js';
import { adminAuth } from '../middlewares/adminAuth.js';
import { authLimiter, otpLimiter } from '../middlewares/rateLimit.js';


const authRoute = express.Router();

authRoute.post('/register', authLimiter, validate(registerSchema), register);
authRoute.post('/login', authLimiter, validate(loginSchema), login);
authRoute.post('/logout', logout);
authRoute.get('/is-auth', adminAuth, isAuthenticated);
authRoute.post('/forgot-password', otpLimiter, validate(forgotPasswordSchema), forgotPassword);
authRoute.post('/reset-password', otpLimiter, validate(resetPasswordSchema), resetPassword);
authRoute.post('/verify-email', otpLimiter, validate(verifyEmailSchema), verifyEmail);

export default authRoute;