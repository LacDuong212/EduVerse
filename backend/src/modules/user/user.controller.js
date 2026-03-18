import asyncHandler from "#utils/asyncHandler.js";
import { withTransaction } from "#utils/transaction.js";
import { sendSuccessResponse } from "#utils/response.js";
import * as userService from "./user.service.js";

// @desc  Get Cloudinary params for uploading avatar
// @route GET /avatar/upload
export const getAvatarParams = asyncHandler(async (req, res) => {
  const user = req.user;
  const result = await userService.getAvatarParams(user.userId);
  return sendSuccessResponse(res, 200, "Get upload params successfull!", result);
});

// @desc  Change user's password
// @route POST /change-password
export const changePassword = asyncHandler(async (req, res) => {
  const user = req.user;
  const { oldPassword, newPassword } = req.body;
  await userService.changePassword(user.userId, oldPassword, newPassword);
  return sendSuccessResponse(res, 200, "Password changed successfully!");
});

// @desc  Update user's interests
// @route PUT /interests
export const updateInterests = asyncHandler(async (req, res) => {
  const user = req.user;
  const { interests } = req.body;
  const result = await userService.updateInterests(user.userId, interests);
  return sendSuccessResponse(res, 200, "Interests updated successfully!", result);
});

// @desc  Patch update a user's profile
// @route PATCH /profile
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const changes = req.body;
  const updated = await userService.updateProfile(userId, changes);
  return sendSuccessResponse(res, 200, "Profile updated successfully!", updated);
});