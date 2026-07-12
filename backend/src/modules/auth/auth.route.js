import express from "express";
import passport from "passport";
import { checkAuth, protect } from "#middlewares/auth.middleware.js";
import { authLimiter, otpLimiter } from "#middlewares/rateLimit.middleware.js";
import validate from "#middlewares/zodValidator.middleware.js";
import * as authController from "#modules/auth/auth.controller.js";
import * as authSchema from "#modules/auth/auth.validation.js";

// @route /auth
const authRoute = express.Router();

authRoute.post("/register", authLimiter, validate(authSchema.registerRequest), authController.register);

authRoute.post("/login", authLimiter, validate(authSchema.loginRequest), authController.login);
authRoute.post("/logout", protect, authController.logout);

authRoute.post("/forget-password", otpLimiter, validate(authSchema.forgetPasswordRequest), authController.forgetPassword);
authRoute.post("/reactivate", otpLimiter, validate(authSchema.verifyEmailRequest), authController.reactivateAccount);
authRoute.post("/reset-password", otpLimiter, validate(authSchema.resetPasswordRequest), authController.resetPassword);

authRoute.post("/verify-email", otpLimiter, validate(authSchema.verifyEmailRequest), authController.verifyEmail);
authRoute.post("/resend-otp", otpLimiter, validate(authSchema.resendOtpRequest), authController.sendOTP);
authRoute.post("/reactivate/send-otp", otpLimiter, validate(authSchema.resendOtpRequest), authController.requestReactivation);

authRoute.get("/status", checkAuth, authController.isAuthenticated);

authRoute.get("/google", (req, res, next) => {
  const redirectTo = req.query.redirectTo || '/';
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
  authController.googleAuthCallback
);

export default authRoute;