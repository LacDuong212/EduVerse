import axios from "axios";
import Notification from "../models/notificationModel.js";
import { withTransaction } from "./transaction.js";

export const notifyUsers = async ({ userIds }) => {
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    throw new Error("Notification failed: At least one user ID is required.");
  }

  try {
    await axios.post(
      `${process.env.EDV_SERVER}/api/internal/notify`,
      { userIds },
      { headers: { 'x-internal-key': process.env.INTERNAL_API_KEY } }
    );
  } catch (error) {
    if (!error.response) {
      const connectionMsg = error.code === 'ECONNREFUSED'
        ? 'Connection refused: Could not reach the notification service'
        : error.code === 'ETIMEDOUT'
        ? 'Connection timeout: Notification service not responding'
        : `Connection failed: ${error.message}`;
      throw new Error(`Notification delivery failed (network issue): ${connectionMsg}`);
    }

    const statusMsg = error.response.status >= 500
      ? `Server error (${error.response.status}): Notification service encountered an error`
      : `Client error (${error.response.status}): Invalid notification request`;
    throw new Error(`Notification delivery failed (HTTP ${error.response.status}): ${statusMsg}`);
  }
};

export const notifyUser = async ({ userId }) => {
  if (!userId) {
    throw new Error("Notification failed: A user ID is required.");
  }

  await notifyUsers({ userIds: [userId] });
};

export const createNotifications = async (userIds, type, message, session = null) => {
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !message)
    throw new Error("Missing necessary info to send multiple notifications.");

  const notificationDocs = userIds.map((userId) => ({
    user: userId,
    type,
    message,
  }));

  return await Notification.insertMany(notificationDocs, { session, ordered: true });
};