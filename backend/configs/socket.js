import { Server } from "socket.io";

let io;
let onlineUsers = [];

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174"],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // 1. Khi user login, báo danh
    socket.on("newUser", (userId) => {
      addNewUser(userId, socket.id);
    });

    // 2. Khi user tắt tab
    socket.on("disconnect", () => {
      removeUser(socket.id);
    });
  });

  return io;
};

// --- Helper Functions ---
const addNewUser = (userId, socketId) => {
  // Xóa socket cũ của user đó nếu có (tránh duplicate)
  onlineUsers = onlineUsers.filter(u => u.userId !== userId); 
  onlineUsers.push({ userId, socketId });
  console.log("Online Users:", onlineUsers);
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

export const getIO = () => io;
export const getOnlineUsers = () => onlineUsers;