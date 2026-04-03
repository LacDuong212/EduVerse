import AppError from "#exceptions/app.error.js";
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
  );
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