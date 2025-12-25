import { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const { userData } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userData && userData._id) {
      const newSocket = io(backendUrl, {
        transports: ['polling', 'websocket'],
        withCredentials: true,

        reconnection: true,
        reconnectionAttempts: 5,
      });

      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("✅ Global Socket Connected:", newSocket.id);
        newSocket.emit("newUser", userData._id);
      });

      newSocket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      // Cleanup: Ngắt kết nối khi user logout hoặc component unmount
      return () => {
        newSocket.close();
        setSocket(null);
      };
    } else {
      // Nếu không có user (Logout), đóng socket nếu đang mở
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [userData]); // Chạy lại mỗi khi userData thay đổi (Login/Logout)

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};