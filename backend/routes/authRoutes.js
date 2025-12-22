import express from 'express';
import { 
    isAuthenticated, 
    register, 
    login, 
    logout,
    forgotPassword, 
    resetPassword,
    verifyEmail } from '../controllers/authController.js';

import { 
    loginSchema, 
    registerSchema, 
    forgotPasswordSchema, 
    resetPasswordSchema,
    verifyEmailSchema
} from '../validations/auth.validation.js';

import passport from 'passport';
import jwt from 'jsonwebtoken';

import validate from '../middlewares/validate.js';
import { checkAuth } from '../middlewares/userAuth.js';

const authRoute = express.Router();

authRoute.post('/register', validate(registerSchema), register);
authRoute.post('/login', validate(loginSchema), login);
authRoute.post('/logout', logout);
authRoute.get('/is-auth', checkAuth, isAuthenticated);
authRoute.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
authRoute.post('/reset-password', validate(resetPasswordSchema), resetPassword);
authRoute.post('/verify-email', validate(verifyEmailSchema), verifyEmail);

authRoute.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

authRoute.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/auth/sign-in`,
    session: false,
  }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { 
        expiresIn: '7d' 
    });

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.redirect(`${process.env.CLIENT_URL}?token=${token}`);
  }
);

export default authRoute;