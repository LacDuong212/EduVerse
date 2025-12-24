import { useEffect, useRef, useState } from "react";
import { BsX, BsSend } from "react-icons/bs";

import LogoBox from "@/components/LogoBox";
import MessageBubble from "./MessageBubble";
import { CHAT_LANGUAGE } from "../constants/chatbot.contants";

export default function ChatWindow({
  containerRef,
  messagesEndRef,
  messages,
  input,
  onInputChange,
  onSend,
  onClose,
  isSending,
}) {
  const [language, setLanguage] = useState(() => {
    return sessionStorage.getItem(CHAT_LANGUAGE) || "en";
  });

  const textareaRef = useRef(null);

  // handle language change
  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    sessionStorage.setItem(CHAT_LANGUAGE, selectedLang);
  };

  // auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      // reset height to shrink if text is deleted
      textareaRef.current.style.height = "auto";
      // limit height, change to scroll
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]); // re-run whenever input text changes

  // handle key press
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevent creating new line
      if (!isSending) onSend(language);
    }
  };

  return (
    <div
      ref={containerRef}
      className="card shadow-lg position-fixed border-0"
      style={{
        bottom: "24px",
        right: "24px",
        width: "40%",
        minWidth: "320px",
        maxWidth: "420px",
        height: "70%",
        borderRadius: "10px",
        zIndex: 103,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Header */}
      <div className="card-header text-white d-flex justify-content-between align-items-center bg-primary">
        <LogoBox width={100} isDarkMode={true} />
        <div className="d-flex align-items-center gap-2">
          {/* Language Selector */}
          <select
            className="form-select form-select-sm text-body border-0"
            value={language}
            onChange={handleLanguageChange}
            style={{
              width: "auto",
              cursor: "pointer",
            }}
          >
            <option value="en">English</option>
            <option value="vi">Vietnamese</option>
          </select>

          <BsX
            size={28}
            style={{ cursor: "pointer" }}
            onClick={onClose}
          />
        </div>
      </div>

      {/* Messages Body */}
      <div className="card-body overflow-auto p-3 bg-secondary bg-opacity-10" style={{ flex: 1 }}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} language={language} />
        ))}
        {isSending && (
          <div className="d-flex justify-content-start mb-2">
            <div className="border fst-italic p-2 rounded-3 small">
              {language === "en" ? "Chatbot is cooking up a response..." : "Chatbot đang soạn câu trả lời..."}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="card-footer bg-body p-2 border-top">
        <div
          className="d-flex align-items-center gap-2 bg-light rounded-2 p-2 border"
          style={{ transition: "border-color 0.2s" }}
        >
          <textarea
            ref={textareaRef}
            className="form-control border-0 bg-transparent shadow-none p-1"
            maxLength={256}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === "en" ? "Type a message..." : "Nhập tin nhắn..."}
            // disabled={isSending}
            rows={1}
            style={{
              resize: "none",
              overflowY: "auto",
              minHeight: "24px",
              maxHeight: "120px",
              fontSize: "0.95rem"
            }}
          />
          <button
            className="btn btn-primary btn-sm rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 m-0 p-1"
            style={{ width: "32px", height: "32px" }}
            onClick={() => onSend(language)}
            disabled={!input.trim() || isSending}
          >
            <BsSend size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}