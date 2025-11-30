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


const authRoute = express.Router();

authRoute.post('/register', validate(registerSchema), register);
authRoute.post('/login', validate(loginSchema), login);
authRoute.post('/logout', logout);
authRoute.get('/is-auth', adminAuth, isAuthenticated);
authRoute.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
authRoute.post('/reset-password', validate(resetPasswordSchema), resetPassword);
authRoute.post('/verify-email', validate(verifyEmailSchema), verifyEmail);

export default authRoute;