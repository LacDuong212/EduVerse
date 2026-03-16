import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";
import * as userService from "./user.service.js";

// @desc  Get Cloudinary params for uploading avatar
// @route GET /avatar/upload
export const getAvatarParams = asyncHandler(async (req, res) => {
  const user = req.user;
  const result = await userService.getAvatarParams(user.userId);
  return sendSuccessResponse(res, 200, "Get upload params successfull!", result);
});