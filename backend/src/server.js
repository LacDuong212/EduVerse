import "dotenv/config";
import http from "http";
import app from "./app.js";
import connectDB from "#config/database.js";
import { initSocket } from "#config/socket.js";
import logger from "#utils/logger.js";
import { startAllTasks } from "#utils/scheduler.js";

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDB();
    logger.info("📂 Database connection established");

    initSocket(server);
    startAllTasks();
    logger.info("⏰ Scheduled tasks and Sockets initialized");

    server.listen(PORT, () => {
      logger.info(`🚀 EduVerse2 Server is sprinting on port ${PORT}`);
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1); // shut down if DB connection fails
  }
};

startServer();