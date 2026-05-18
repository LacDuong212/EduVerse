import { Server } from "socket.io";
import logger from "#utils/logger.js";

let io;
let onlineUsers = [];

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        process.env.CLIENT_URL,
      ],
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ["polling", "websocket"],
    pingTimeout: 60000,
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    }
  });

  io.on("connection", (socket) => {
    // logger.debug(`[Socket] New client connected: ${socket.id}`);

    socket.on("newUser", (userId) => {
      addNewUser(userId, socket.id);
    });

    socket.on("disconnect", (reason) => {
      logger.debug(`[Socket] Disconnected (${reason}): ${socket.id}`);

      if (reason === "transport close" || reason === "ping timeout") {
        setTimeout(() => {
          removeUser(socket.id);
        }, 2 * 60 * 1000);
      } else {
        removeUser(socket.id);
      }
    });
  });

  return io;
};

const addNewUser = (userId, socketId) => {
  onlineUsers = onlineUsers.filter(u => u.userId !== userId);
  onlineUsers.push({ userId, socketId });
  io.emit("getOnlineUsers", onlineUsers);
  logger.debug(`[Socket] Online Users: ${onlineUsers.length}`);
  // logger.debug(`[Socket] Online Users (${onlineUsers.length}): [ ${onlineUsers.map(u => u.userId).join(', ')} ]`);
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
  if (io) io.emit("getOnlineUsers", onlineUsers);
};

export const getIO = () => io;
export const getOnlineUsers = () => onlineUsers;