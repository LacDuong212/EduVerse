import { setTokenCookie } from "#utils/cookie.js";
import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse, sendUnsuccessResponse } from "#utils/response.js";
import * as authService from "./auth.service.js";

// @desc  Register a new user
// @route POST /register
export const register = asyncHandler(async (req, res) => {
  await authService.registerUser(req.body);
  sendSuccessResponse(res, 200, true, "Registration successful! Please check your email for the OTP to verify your account.");
});

// @desc  Login user
// @route POST /login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await authService.loginUser(email, password);

  setTokenCookie(res, user.userId);

  return sendSuccessResponse(res, 200, "Login successful", user);
});

// @desc  Logout user
// @route POST /logout
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    path: '/'
  });

  sendSuccessResponse(res, 200, "Logged out successfully");
});

// @desc  Verify email with OTP
// @route POST /verify-email
export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  await authService.verifyEmail(email, otp);

  sendSuccessResponse(res, 200, "Email verified successfully. Please log in to continue.");
});

// @desc  Resend OTP for email verification
// @route POST /forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  await authService.sendPasswordResetOtp(email);

  return sendSuccessResponse(res, 200, "New OTP sent to your email");
});

// @desc  Reset password using OTP
// @route POST /reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  await authService.resetPassword(email, otp, newPassword);

  return sendSuccessResponse(res, 200, "Password reset successfully");
});

// @desc  Resend OTP for email verification
// @route POST /resend-otp
export const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  await authService.resendVerificationOtp(email);

  return sendSuccessResponse(res, 200, "OTP sent. Please check your email!");
});

// @desc  Check if user is authenticated
// @route GET /status
export const isAuthenticated = (req, res) => {
  const { isValid, user } = authService.checkValidUser(req.user);

  if (isValid) return sendSuccessResponse(res, 200, "User is authenticated", user);
  return sendUnsuccessResponse(res, 200, "Guest user", null);
};

// @desc  Google OAuth callback
// @route GET /google/callback
export const googleAuthCallback = asyncHandler(async (req, res) => {
  const user = req.user;

  setTokenCookie(res, user.userId);

  const redirectTo = req.query.state || "/";
  res.redirect(`${process.env.CLIENT_URL}${redirectTo}`);
});