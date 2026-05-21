import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";
import * as userService from "./user.service.js";

// @desc  Get Cloudinary params for uploading avatar
// @route GET /avatar/upload
export const getAvatarParams = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const result = await userService.getAvatarParams(userId);
  return sendSuccessResponse(res, 200, "Get upload params successfull!", result);
});

// @desc  Change user's password
// @route POST /change-password
export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { oldPassword, newPassword } = req.validated?.body || {};
  await userService.changePassword(userId, oldPassword, newPassword);
  return sendSuccessResponse(res, 200, "Password changed successfully!");
});

// @desc  Deactivate account
// @route POST /deactivate
export const deactivate = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  await userService.deactivateAccount(userId);

  res.clearCookie("edv_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    path: '/'
  });
  
  return sendSuccessResponse(res, 200, "Account have been deactivated.");
});

// @desc 