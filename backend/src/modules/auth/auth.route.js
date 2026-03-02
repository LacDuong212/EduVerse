import express from "express";
import jwt from "jsonwebtoken";
import passport from "passport";

import { JWT_EXPIRATION } from "#constants/others.js";
import { checkAuth } from "#middlewares/user.auth.js";
import validate from "#middlewares/validate.js";
import { 
  register,
  login,
  logout,
  isAuthenticated,
  forgotPassword,
  resetPassword,
  verifyEmail,
  sendOTP
} from "#modules/auth/auth.controller.js";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema
} from "#modules/auth/auth.validation.js";


const authRoute = express.Router();

authRoute.post("/register", validate(registerSchema), register);
authRoute.post("/login", validate(loginSchema), login);
authRoute.post("/logout", logout);
authRoute.get("/is-auth", checkAuth, isAuthenticated);
authRoute.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
authRoute.post("/reset-password", validate(resetPasswordSchema), resetPassword);
authRoute.post("/verify-email", validate(verifyEmailSchema), verifyEmail);
authRoute.post("/send-otp", sendOTP);

authRoute.get("/google", (req, res, next) => {
  const redirectTo = req.query.redirectTo || "/";

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: redirectTo,
  })(req, res, next);
});

authRoute.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/auth/sign-in`,
    session: false,
  }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const redirectTo = req.query.state || '/';
    res.redirect(process.env.CLIENT_URL + redirectTo);
  }
);

export default authRoute;