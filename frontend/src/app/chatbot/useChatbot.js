import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { authApi } from "@/utils/api";
import { mapResponseErrors } from "@/utils/mapper";
import { handleRequest } from "@/utils/request";
import { GUEST_CHAT_SESSION_ID } from "./chatbot.constants";

const sendMessageToApi = async (message, sessionId, languageCode = "en") => {
  const response = await handleRequest(authApi.post(
    "/chatbot/message",
    { sessionId, message, language: languageCode }
  ));

  if (response.success) return response.result;
  else throw mapResponseErrors(response.errors);
};

export const useChatbot = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.auth);

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! I'm your EduVerse Assistant, how may I help you?",
      isWelcome: true,
    },
  ]);
  const [isSending, setIsSending] = useState(false);

  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);

  const sessionId = useMemo(() => {
    if (userData && userData.userId) {
        sessionStorage.removeItem(GUEST_CHAT_SESSION_ID); 
        return `edv_user_${userData.userId}`;
    }

    let guestId = sessionStorage.getItem(GUEST_CHAT_SESSION_ID);
    
    if (!guestId) {
        guestId = `edv_guest_${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem(GUEST_CHAT_SESSION_ID, guestId);
    }
    
    return guestId;
  }, [userData]);

  // Core send routine — takes explicit text so it works for both the input box
  // and quick-reply chips (which don't go through the input state).
  const sendText = async (text, language = "en") => {
    const trimmed = (text || "").trim();
    if (!trimmed || isSending) return;

    const userMessage = { from: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);

    setIsSending(true);

    try {
      const data = await sendMessageToApi(trimmed, sessionId, language);

      const botMessage = {
        from: "bot",
        text: data.reply || (language === "vi" ? "(Không có phản hồi)" : "(No reply)"),
        action: data.action,
        suggestions: data.suggestions,
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
      setIsSending(false);
    }
  };

  const handleSendMessage = async (language = "en") => {
    if (!input.trim() || isSending) return;
    const currentInput = input;
    setInput("");
    await sendText(currentInput, language);
  };

  // Fired when a quick-reply chip is clicked.
  const handleSuggestionClick = (query, language = "en") => {
    sendText(query, language);
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
    handleSuggestionClick,
    chatRef,
    messagesEndRef,
    isSending,
  };
};