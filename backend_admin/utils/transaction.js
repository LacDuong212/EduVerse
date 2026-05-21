import mongoose from "mongoose";

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