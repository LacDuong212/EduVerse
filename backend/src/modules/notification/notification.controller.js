import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse, sendUnsuccessResponse } from "#utils/response.js";
import * as notifService from "./notification.service.js";
import * as notifMapper from "./notification.mapper.js";

// @desc  Get all of user's notifications
// @route GET ...?limit=
export const getMyNotifications = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { limit } = req.validated?.query || {};
  const notifications = await notifService.getUserNotifications(userId, limit);
  return sendSuccessResponse(
    res,
    200,
    "Notifications retrieved!",
    notifMapper.toNotifDtoList(notifications)
  );
});

// @desc  Mark all user's notifications as read
// @route PATCH /read
export const markAllRead = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  await notifService.markAllAsRead(userId);
  return sendSuccessResponse(res, 200, "All notifications marked as read!");
});

// @desc  Mark one user's notification as read
// @route PATCH /:id/read
export const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { id } = req.validated?.params || {};

  const notif = notifMapper.toNotifDto(await notifService.markOneAsRead(userId, id));
  if (notif?.isRead)
    return sendSuccessResponse(res, 200, "Marked notification as read successfully!", notif);
  else
    return sendUnsuccessResponse(res, 500, "Failed to mark your notification as read.");
});

// @desc  Delete all user's notifications
// @route DELETE /
export const deleteAllNotifications = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  await notifService.clearAllNotifications(userId);
  return sendSuccessResponse(res, 200, "All notifications cleared!");
});

// @desc  Count all of user's notifications
// @route GET /count
export const countMyNoftications = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const result = await notifService.getAllNotificationCount(userId);
  return sendSuccessResponse(
    res,
    200,
    `You have ${result} notification${result === 1 ? "" : "s"}!`,
    result
  );
});

// @desc  Count all of user's unread notifications
// @route GET /unread/count
export const countMyUnreadNoftications = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const result = await notifService.getUnreadNotificationCount(userId);
  return sendSuccessResponse(
    res,
    200,
    `You have ${result} unread notification${result === 1 ? "" : "s"}!`,
    result
  );
});