import { Server } from "socket.io";

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
    socket.on("newUser", (userId) => {
      addNewUser(userId, socket.id);
    });

    socket.on("disconnect", () => {
      removeUser(socket.id);
    });
  });

  return io;
};

const addNewUser = (userId, socketId) => {
  onlineUsers = onlineUsers.filter(u => u.userId !== userId); 
  onlineUsers.push({ userId, socketId });
  console.log("Online Users:", onlineUsers);
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

export const getIO = () => io;
export const getOnlineUsers = () => onlineUsers;