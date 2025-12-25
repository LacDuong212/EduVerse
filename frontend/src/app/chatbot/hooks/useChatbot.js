import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import useProfile from "@/hooks/useProfile";
import { sendMessageToApi } from "../api/chatbot.api";
import { GUEST_CHAT_SESSION_ID } from "../constants/chatbot.contants";

export const useChatbot = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useProfile();

  // state
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! I'm your EduVerse Assistant, how may I help you?",
    },
  ]);
  const [isSending, setIsSending] = useState(false);

  // refs
  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);

  // get chat session
  const sessionId = useMemo(() => {
    // if a logged-in user
    if (user && user._id) {
        // clear any guest session
        sessionStorage.removeItem(GUEST_CHAT_SESSION_ID); 
        return `edv_user_${user._id}`;
    }

    // if a guest
    let guestId = sessionStorage.getItem(GUEST_CHAT_SESSION_ID);
    
    if (!guestId) {
        // generate a random string + timestamp for uniqueness
        guestId = `guest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem(GUEST_CHAT_SESSION_ID, guestId);
    }
    
    return guestId;
  }, [user]); // re-calc if user logs in/out

  // send message
  const handleSendMessage = async (language = "en") => {
    if (!input.trim() || isSending) return;

    // optimistic UI update
    const currentInput = input;
    const userMessage = { from: "user", text: currentInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // lock UI (prevent user spamming messages)
    setIsSending(true);

    try {
      const data = await sendMessageToApi(currentInput, sessionId, language);

      const botMessage = {
        from: "bot",
        text: data.reply || (language === "vi" ? "(Không có phản hồi)" : "(No reply)"),
        action: data.action,
      };

      setMessages((prev) => [...prev, botMessage]);

      if (data.action && data.action.type === "redirect" && data.action.url) {
        setTimeout(() => {
          navigate(data.action.url);
        }, 2000);
      }

    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: language === "vi" ? "Lỗi kết nối máy chủ." : "Error connecting to server." },
      ]);
    } finally {
      // unlock the UI
      setIsSending(false);
    }
  };

  // close on click outside chat window
  useEffect(() => {
    function handleClickOutside(e) {
      if (chatRef.current && !chatRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // scroll to bottom
  useEffect(() => {
    // to overwrite the global scrollToTop component
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);

    return () => clearTimeout(timer);
  }, [messages, location.pathname, isOpen]);

  return {
    isOpen,
    setIsOpen,
    messages,
    input,
    setInput,
    handleSendMessage,
    chatRef,
    messagesEndRef,
    isSending,
  };
};