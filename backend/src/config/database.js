import mongoose from "mongoose";
import logger from "#utils/logger.js";

const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    logger.info("📂 MongoDB connected successfully to Atlas");
  });

  mongoose.connection.on("error", (err) => {
    logger.error("⚠️ MongoDB connection pool error detected:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    logger.warn("⚠️ MongoDB disconnected from Atlas. Attempting to reconnect...");
  });

  mongoose.connection.on("reconnected", () => {
    logger.info("✅ MongoDB successfully reconnected to Atlas.");
  });

  await mongoose.connect(`${process.env.MONGODB_URI}`, {
    serverSelectionTimeoutMS: 5000,
  });
}

export default connectDB;