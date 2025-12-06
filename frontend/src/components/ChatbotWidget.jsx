import LogoBox from "./LogoBox";
import { useEffect, useRef, useState } from "react";
import { BsChatDots, BsX, BsSend } from "react-icons/bs";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! I'm your EduVerse Assistant, how may I help you?",
    },
  ]);
  const [input, setInput] = useState("");
  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);

  // close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (chatRef.current && !chatRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input; // keep a copy
    setInput("");

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chatbot/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput,
          sessionId: "sample-0712", // #TODO: user or guest
          languageCode: "en-US",
        }),
      });

      const data = await res.json();
      const botMessage = {
        from: "bot",
        text: data.reply || "(No reply from bot)",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Error connecting to server." },
      ]);
      console.error(err);
    }
  };

  // scroll to new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="btn rounded-circle shadow-lg position-fixed d-flex align-items-center justify-content-center bg-primary border border-primary"
          style={{
            bottom: "24px",
            right: "24px",
            width: "60px",
            height: "60px",
            zIndex: 103,
          }}
        >
          <BsChatDots size={24} className="text-white" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          ref={chatRef}
          className="card shadow-lg position-fixed border-0"
          style={{
            bottom: "24px",
            right: "24px",
            width: "350px",
            height: "500px",
            borderRadius: "15px",
            zIndex: 1050,
            overflow: "hidden", // Ensure header/footer round correctly
          }}
        >
          {/* Header */}
          <div className="card-header text-white d-flex justify-content-between align-items-center bg-primary">
            <LogoBox width={100} isDarkMode={true} />
            <BsX
              size={28}
              style={{ cursor: "pointer" }}
              onClick={() => setOpen(false)}
            />
          </div>

          {/* Messages Body */}
          <div className="card-body overflow-auto p-3 bg-secondary bg-opacity-10">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`d-flex mb-2 ${
                  msg.from === "user"
                    ? "justify-content-end"
                    : "justify-content-start"
                }`}
              >
                <div
                  className={`p-2 rounded-3 text-break ${
                    msg.from === "user" ? "text-white bg-primary" : "border"
                  }`}
                  style={{ maxWidth: "80%" }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="card-footer bg-opacity-10 p-3 border-top-0">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                className="btn text-white bg-primary"
                onClick={sendMessage}
              >
                <BsSend size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}