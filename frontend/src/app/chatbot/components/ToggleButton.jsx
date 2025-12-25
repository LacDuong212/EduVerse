import { BsChatDots } from "react-icons/bs";

export default function ChatButton({ onClick }) {
  return (
    <button
      onClick={onClick}
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
  );
}