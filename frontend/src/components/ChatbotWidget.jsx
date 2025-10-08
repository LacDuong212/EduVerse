import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! I'm your EduVerse Assistant, how may I help you?"
    },
  ]);
  const [input, setInput] = useState("");
  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Close when clicking outside
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
      const res = await fetch("http://localhost:5000/api/chatbot/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput,
          sessionId: "test_123",  // #TODO: user or guest
          languageCode: "en-US"
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
    <div>
      {/* Floating Button */}
      {!open && (
        <Button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 w-15 h-15 rounded-full bg-[#0455bf] hover:bg-[#0346a0] shadow-lg flex items-center justify-center cursor-pointer"
        >
          <MessageCircle size={24} className="text-white" />
        </Button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          ref={chatRef}
          className="fixed bottom-6 right-6 w-80 h-[500px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden border"
        >
          {/* Header */}
          <div className="bg-[#0455bf] text-white flex items-center justify-between px-4 py-2">
            <span className="font-semibold">EduVerse Assistant</span>
            <X
              size={22}
              className="cursor-pointer hover:opacity-80"
              onClick={() => setOpen(false)}
            />
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2 messages-container">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`inline-block p-2 rounded-lg max-w-[80%] text-sm whitespace-pre-wrap break-words ${msg.from === "user" ? "bg-blue-100 text-left"
                    : "bg-gray-100 text-left"
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button
              onClick={sendMessage}
              className="bg-[#0455bf] hover:bg-[#0346a0] cursor-pointer"
            >
              <Send size={16} className="text-white" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
