import "dotenv/config";
import http from "http";
import app from "./app.js";
import connectDB from "#config/database.js";
import { initSocket } from "#config/socket.js";
import { startAllTasks } from "#utils/scheduler.js";

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDB();
    console.log("📂 Database connected successfully");

    initSocket(server);
    startAllTasks();
    console.log("⏰ Scheduled tasks and Sockets initialized");

    server.listen(PORT, () => {
      console.log(`🚀 EduVerse2 Server is sprinting on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1); // shut down if DB connection fails
  }
};

startServer();