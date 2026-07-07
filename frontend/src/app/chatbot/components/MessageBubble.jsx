import { FaAngleRight, FaBook, FaPlayCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { WELCOME_SUGGESTIONS } from "../chatbot.constants";
import CourseCard from "./CourseCard";
import SuggestionChips from "./SuggestionChips";

export default function ChatMessage({
  message,
  language = "en",
  onSuggestion,
  isSending,
}) {
  const isUser = message.from === "user";
  const { action } = message;

  const isLearningProgress = action && action.courseTitle;
  const hasCards = action && action.type === "cards" && action.courses?.length > 0;
  const hasActionButton = action && action.url && !isLearningProgress;

  // Welcome message shows the preset suggestions in the current language;
  // bot replies carry their own resolved suggestions from the backend.
  const suggestions = message.isWelcome
    ? WELCOME_SUGGESTIONS[language] || WELCOME_SUGGESTIONS.en
    : message.suggestions;

  return (
    <div className={`d-flex mb-2 ${isUser ? "justify-content-end" : "justify-content-start"}`}>
      <div
        className={`p-2 rounded-3 text-break ${isUser ? "text-white bg-primary" : "border"}`}
        style={{ maxWidth: "85%" }}
      >
        {/* Message Text */}
        <div style={{ whiteSpace: "pre-wrap" }}>{message.text}</div>

        {/* Recommended course cards */}
        {!isUser && hasCards && (
          <div className="mt-2 border-top pt-2">
            {action.courses.map((course) => (
              <CourseCard key={course.courseId} course={course} language={language} />
            ))}
          </div>
        )}

        {/* Action button / redirect / learning-progress card */}
        {!isUser && action && (hasActionButton || isLearningProgress) && (
          <div className="mt-2 border-top pt-2">

            {/* if search courses / faq link */}
            {action.type === "link" && (
              <Link
                to={action.url}
                className="btn btn-sm btn-outline-primary w-100 fw-bold mb-0"
              >
                {action.label || (language === "vi" ? "Xem chi tiết" : "View Details")}
              </Link>
            )}

            {/* if navigate pages */}
            {action.type === "redirect" && !isLearningProgress && (
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

        {/* Quick-reply suggestion chips */}
        {!isUser && (
          <SuggestionChips
            suggestions={suggestions}
            onSelect={onSuggestion}
            disabled={isSending}
          />
        )}
      </div>
    </div>
  );
}
