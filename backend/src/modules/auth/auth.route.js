import express from "express";
import passport from "passport";

import { checkAuth, protect } from "#middlewares/auth.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js";
import * as authController from "#modules/auth/auth.controller.js";
import * as authSchema from "#modules/auth/auth.validation.js";

// @route /auth
const authRoute = express.Router();

authRoute.post("/register", validate(authSchema.registerRequest), authController.register);
authRoute.post("/verify-email", validate(authSchema.verifyEmailRequest), authController.verifyEmail);
authRoute.post("/resend-otp", validate(authSchema.resendOtpRequest), authController.sendOTP);

authRoute.post("/login", validate(authSchema.loginRequest), authController.login);
authRoute.post("/logout", protect, authController.logout);

authRoute.post("/forget-password", validate(authSchema.forgetPasswordRequest), authController.forgetPassword);
authRoute.post("/reset-password", validate(authSchema.resetPasswordRequest), authController.resetPassword);

authRoute.get("/status", checkAuth, authController.isAuthenticated);

authRoute.get("/google", (req, res, next) => {
  const redirectTo = req.query.redirectTo || '/';
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: redirectTo,  // passes the return path through Google and back to us
  })(req, res, next);
});

authRoute.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/auth/sign-in`,
    session: false,
  }),
  authController.googleAuthCallback
);

export default authRoute;