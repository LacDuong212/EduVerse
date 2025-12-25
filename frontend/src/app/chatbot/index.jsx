import ChatWindow from "./components/ChatWindow";
import ChatButton from "./components/ToggleButton";
import { useChatbot } from "./hooks/useChatbot";

export default function ChatbotWidget() {
  // get all logic and state
  const {
    isOpen,
    setIsOpen,
    messages,
    input,
    setInput,
    handleSendMessage,
    chatRef,
    messagesEndRef,
    isSending,
  } = useChatbot();

  return (
    <>
      {/* Render chatbot button if closed */}
      {!isOpen && <ChatButton onClick={() => setIsOpen(true)} />}

      {/* Render chatbot window if open */}
      {isOpen && (
        <ChatWindow
          containerRef={chatRef}
          messagesEndRef={messagesEndRef}
          messages={messages}
          input={input}
          onInputChange={setInput}
          onSend={handleSendMessage}
          onClose={() => setIsOpen(false)}
          isSending={isSending}
        />
      )}
    </>
  );
}