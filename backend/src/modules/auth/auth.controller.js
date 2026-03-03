import { COOKIE_MAX_AGE } from "#constants/others.js";
import asyncHandler from "#utils/asyncHandler.js";
import { sendResponse } from "#utils/responseHandler.js";
import * as authService from "./auth.service.js";

export const register = asyncHandler(async (req, res) => {
  await authService.registerUser(req.body);
  sendResponse(res, 200, true, "Registration successful! Please check your email for the OTP to verify your account.");
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { token, user } = await authService.loginUser(email, password);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: COOKIE_MAX_AGE,
    path: '/'
  });

  return sendResponse(res, 200, "Login successful", { user });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    path: '/'
  });

  sendResponse(res, 200, "Logged out successfully");
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  await authService.verifyEmail(email, otp);

  sendResponse(res, 200, "Email verified successfully. Please log in to continue.");
});

