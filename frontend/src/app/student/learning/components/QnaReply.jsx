import { Badge } from "react-bootstrap";
import { sanitizeHtml } from "@/utils/sanitize";
import "react-quill-new/dist/quill.snow.css";
import { BsPersonCircle, BsTrash } from "react-icons/bs";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export default function QnaReply({ reply, onDelete, submitting }) {
  const { id, content, author, isInstructorPost, isMyPost, createdAt } = reply;

  return (
    <div
      className={`border rounded-3 p-3 position-relative ${isInstructorPost ? "border-info" : ""}`}
      style={
        isInstructorPost
          ? { background: "rgba(var(--bs-info-rgb), 0.03)" }
          : undefined
      }
    >
      {/* ── Top-right actions ── */}
      {isMyPost && (
        <div className="position-absolute top-0 end-0 p-3 d-flex align-items-center gap-2">
          <button
            className="btn btn-link p-0 text-danger opacity-75 text-decoration-none mb-0"
            onClick={() => onDelete(id)}
            disabled={submitting}
            title="Delete reply"
          >
            <BsTrash size={16} />
          </button>
        </div>
      )}

      {/* ── Author row ── */}
      <div className="d-flex align-items-center gap-3 mb-3">
        <div className="flex-shrink-0">
          {author?.avatar ? (
            <img
              src={author.avatar}
              alt={author.name}
              className="rounded-circle"
              width={38}
              height={38}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <BsPersonCircle size={38} className="text-body" style={{ opacity: 0.35 }} />
          )}
        </div>

        <div className="flex-grow-1 min-w-0">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="fw-semibold text-body" style={{ fontSize: "0.9rem" }}>
              {author?.name || "User"}
            </span>
            {isInstructorPost && (
              <Badge bg="primary" style={{ fontSize: "0.68rem" }}>
                Instructor
              </Badge>
            )}
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap mt-1">
            <span className="text-body" style={{ opacity: 0.6, fontSize: "0.78rem" }}>
              {formatDate(createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div
        className="ql-editor p-0"
        style={{ fontSize: "0.9rem" }}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
      />
    </div>
  );
}