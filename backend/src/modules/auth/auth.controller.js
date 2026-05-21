import { setTokenCookie } from "#utils/cookie.js";
import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse, sendUnsuccessResponse } from "#utils/response.js";
import * as authService from "./auth.service.js";

// @desc  Register a new user
// @route POST /register
export const register = asyncHandler(async (req, res) => {
  const body = req.validated?.body || {};
  await authService.registerUser(body);
  sendSuccessResponse(res, 200, "Registration successful! Please check your email for the OTP to verify your account.");
});

// @desc  Login user
// @route POST /login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated?.body || {};
  const user = await authService.loginUser(email, password);
  setTokenCookie(res, user.userId);
  return sendSuccessResponse(res, 200, "Login successful!", user);
});

// @desc  Logout user
// @route POST /logout
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("edv_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    path: '/'
  });

  sendSuccessResponse(res, 200, "Logged out successfully!");
});

// @desc  Verify email with OTP
// @route POST /verify-email
export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.validated?.body || {};
  await authService.verifyEmail(email, otp);
  sendSuccessResponse(res, 200, "Email verified successfully. Please log in to continue!");
});

// @desc  Resend OTP for email verification
// @route POST /forget-password
export const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.validated?.body || {};
  await authService.sendResetOtp(email);
  return sendSuccessResponse(res, 200, "OTP sent. Please check your email!");
});

// @desc  Reset password using OTP
// @route POST /reset-password
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.validated?.body || {};
  await authService.resetPassword(email, otp, newPassword);
  return sendSuccessResponse(res, 200, "Password reset successfully!");
});

// @desc  Resend OTP for email verification
// @route POST /resend-otp
export const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.validated?.body || {};
  await authService.sendVerificationOtp(email);
  return sendSuccessResponse(res, 200, "OTP sent. Please check your email!");
});

// @desc  Send OTP for account reactivation
// @route POST /reactivate/send-otp
export const requestReactivation = asyncHandler(async (req, res) => {
  const { email } = req.validated?.body || {};
  await authService.sendReactivationOtp(email);
  return sendSuccessResponse(res, 200, "OTP sent. Please check your email!");
});

// @desc  Reactivation account
// @route POST /reactivate
export const reactivateAccount = asyncHandler(async (req, res) => {
  const { email, otp } = req.validated?.body || {};
  await authService.reactivateAccount(email, otp);
  return sendSuccessResponse(res, 200, "Account reactivated successfully!");
});

// @desc  Check if user is authenticated
// @route GET /status
export const isAuthenticated = async (req, res) => {
  const { isValid, user } = await authService.checkValidUser(req.user);
  if (isValid) return sendSuccessResponse(res, 200, "User is authenticated.", user);
  return sendUnsuccessResponse(res, 200, "Guest user.", null);
};

// @desc  Google OAuth callback
// @route GET /google/callback
export const googleAuthCallback = asyncHandler(async (req, res) => {
  const user = req.user;
  setTokenCookie(res, user.userId);
  const redirectTo = req.query.state || "/";
  res.redirect(`${process.env.CLIENT_URL}${redirectTo}`);
});