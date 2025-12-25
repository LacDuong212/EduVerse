import { FaAngleRight, FaBook, FaPlayCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function ChatMessage({ message, language = "en" }) {
  const isUser = message.from === "user";
  const { action } = message;

  const isLearningProgress = action && action.courseTitle;

  return (
    <div className={`d-flex mb-2 ${isUser ? "justify-content-end" : "justify-content-start"}`}>
      <div
        className={`p-2 rounded-3 text-break ${isUser ? "text-white bg-primary" : "border"}`}
        style={{ maxWidth: "80%" }}
      >
        {/* Message Text */}
        <div>{message.text}</div>

        {/* Action Button (chatbot only) */}
        {!isUser && action && action.url && (
          <div className="mt-2 border-top pt-2">

            {/* if search courses */}
            {action.type === "link" && (
              <Link
                to={action.url}
                className="btn btn-sm btn-outline-primary w-100 fw-bold mb-0"
              >
                {action.label || (language === "vi" ? "Xem chi tiết" : "View Details")}
              </Link>
            )}

            {/* if navigate pages */}
            {action.type === "redirect" && (
              <div>
                <small className="d-block mb-1 fst-italic">
                  {language === "vi" ? "Tự động chuyển hướng sau 2s..." : "Redirecting in 2s..."}
                </small>
                <Link
                  to={action.url}
                  className="fw-bold text-primary text-decoration-none mb-0"
                >
                  {action.label}<span><FaAngleRight size={22} className="pb-1" /></span>
                </Link>
              </div>
            )}

            {/* if learning progress */}
            {isLearningProgress && (
              <div className="bg-light rounded p-2 border">
                {/* Course Header */}
                <div className="d-flex align-items-center gap-2 mb-2">
                  <FaBook className="text-success" />
                  <span className="fw-bold text-dark small text-truncate" style={{ maxWidth: "180px" }}>
                    {action.courseTitle}
                  </span>
                </div>

                {/* Progress Stats */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-secondary text-white" style={{ fontSize: "0.7rem" }}>
                    {language === "vi"
                      ? `Đã học ${action.progress || 0} bài`
                      : `${action.progress || 0} lessons done`}
                  </span>
                </div>

                {/* Resume Button */}
                <Link
                  to={action.url}
                  className="btn btn-sm btn-success w-100 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                  style={{ fontSize: "0.85rem" }}
                >
                  <FaPlayCircle />
                  {action.label || (language === "en" ? "Resume Learning" : "Tiếp Tục Học")}
                </Link>

                {/* Auto-redirect helper text (if it is a redirect type) */}
                {action.type === "redirect" && (
                  <div className="text-center mt-1">
                    <small className="fst-italic" style={{ fontSize: "0.65rem" }}>
                      {language === "vi" ? "Đang mở..." : "Opening..."}
                    </small>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}