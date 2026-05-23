import { sendNotification } from "#modules/notification/notification.service.js";
import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";

// @desc  Notify specific user
// @route POST /notify
export const notifyUser = asyncHandler(async (req, res) => {
  const { userId, type, message } = req.validated?.body || {};
  await sendNotification(userId, type, message);
  return sendSuccessResponse(res, 200, "Apply for instructor successfully. Please wait for approval!");
});