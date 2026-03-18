import mongoose from "mongoose";

/**
 * Managed transaction wrapper that supports session joining.
 * @param {Function} work - Async logic: (session) => Promise
 * @param {mongoose.ClientSession} [session] - Optional existing session
 */
export const withTransaction = async (work, session = null) => {
  if (session) return await work(session);

  const newSession = await mongoose.startSession();
  try {
    let result;
    await newSession.withTransaction(async () => {
      result = await work(newSession);
    });
    
    return result;
  } finally {
    await newSession.endSession();
  }
};