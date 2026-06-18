import { notifyUsers } from "#modules/notification/notification.service.js";
import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";

// @desc  Notify specific user
// @route POST /notify
export const notify = asyncHandler(async (req, res) => {
  const { userIds } = req.validated?.body || {};
  await notifyUsers(userIds);
  return sendSuccessResponse(res, 200, "Notified user(s) successfully!");
});