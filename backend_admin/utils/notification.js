import axios from "axios";
import { withTransaction } from "./transaction.js";

export const notifyUser = async ({ userId, type, message }) => {
  if (!userId) {
    throw new Error("Notification failed: userId is required.");
  }
  if (!message) {
    throw new Error("Notification failed: message body is required.");
  }

  await axios.post(
    `${process.env.EDV_SERVER}/api/internal/notify`,
    { userId, type, message },
    { headers: { 'x-internal-key': process.env.INTERNAL_API_KEY } }
  );
};

export const notifyAll = async () => { };