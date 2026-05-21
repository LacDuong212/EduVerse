import { getIO, getOnlineUsers } from "#config/socket.js";
import AppError from "#exceptions/app.error.js";
import logger from "#utils/logger.js";
import { withTransaction } from "#utils/transaction.js";
import { toNotifDto } from "./notification.mapper.js";
import Notification from "./notification.model.js";

export const getUserNotifications = async (userId, limit = 50) => {
  if (!userId) throw new AppError("User ID is required.", 400);
  return await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

export const markAllAsRead = async (userId) => {
  if (!userId) throw new AppError("User ID is required.", 400);

  const result = await Notification.updateMany(
    { user: userId, isRead: false },
    { $set: { isRead: true } }
  );

  return result.modifiedCount;
};

export const markOneAsRead = async (userId, notifId) => {
  if (!userId) throw new AppError("User ID is required.", 400);

  const notif = await Notification.findOneAndUpdate(
    { _id: notifId, user: userId },
    { isRead: true },
    { new: true }
  ).lean();

  if (!notif) throw new AppError("Notification not found.", 404);

  return notif;
};

export const clearAllNotifications = async (userId) => {
  if (!userId) throw new AppError("User ID is required.", 400);
  return await Notification.deleteMany({ user: userId });
};

export const getUnreadNotificationCount = async (userId) => {
  if (!userId) throw new AppError("User ID is required.", 400);
  return await Notification.countDocuments({ user: userId, isRead: false });
};

export const getAllNotificationCount = async (userId) => {
  if (!userId) throw new AppError("User ID is required.", 400);
  return await Notification.countDocuments({ user: userId });
};

export const sendNotification = async (userId, type, message, session = null) => {
  if (!userId || !message)
    throw new AppError("Missing necessary info to send a notification.", 400);

  const newNotif = await withTransaction(async (s) => {
    const [notification] = await Notification.create(
      [{ user: userId, type, message }],
      { session: s }
    );

    return notification;
  }, session);

  const notifDto = toNotifDto(newNotif);

  try {
    const onlineUsers = getOnlineUsers();
    const receiver = onlineUsers.find((u) => u.userId === userId.toString());

    if (receiver) {
      const io = getIO();
      if (io) io.to(receiver.socketId).emit("getNotification", notifDto);
    }
  } catch (socketError) {
    logger.error("Real-time notification emit failed:", socketError);
  }

  return notifDto;
};