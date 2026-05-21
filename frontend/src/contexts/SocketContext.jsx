import { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const SocketContext = createContext();
export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({ children }) => {
  const { userData } = useSelector((state) => state.auth);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (userData?.userId) {
      const newSocket = io(backendUrl, {
        transports: ["polling", "websocket"],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
      });

      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Global Socket Connected:", newSocket.id);
        newSocket.emit("newUser", userData.userId);
      });

      const handleOnlineUsers = (users) => {
        setOnlineUsers(users);
      };

      newSocket.on("getOnlineUsers", handleOnlineUsers);

      return () => {
        newSocket.off("getOnlineUsers", handleOnlineUsers);
        newSocket.close();
        setSocket(null);
      };
    } else if (socket) {
      socket.close();
      setSocket(null);
    }
  }, [userData]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};