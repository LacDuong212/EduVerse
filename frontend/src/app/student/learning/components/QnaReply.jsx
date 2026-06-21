import { Badge } from "react-bootstrap";
import "react-quill-new/dist/quill.snow.css";
import { BsPersonCircle, BsTrash } from "react-icons/bs";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function QnaReply({ reply, onDelete, submitting }) {
  const { id, content, author, isInstructorPost, isMyPost, createdAt } = reply;

  return (
    <div
      className={`rounded-2 p-3 ${isInstructorPost ? "border border-info" : ""}`}
      style={{ background: "var(--bs-tertiary-bg, rgba(0,0,0,0.025))" }}
    >
      <div className="d-flex gap-2">
        <div className="flex-shrink-0">
          {author?.avatar ? (
            <img
              src={author.avatar}
              alt={author.name}
              className="rounded-circle"
              width={28}
              height={28}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <BsPersonCircle size={28} className="text-body" style={{ opacity: 0.35 }} />
          )}
        </div>

        <div className="flex-grow-1 min-w-0">
          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
            <span className="fw-semibold text-body" style={{ fontSize: "0.85rem" }}>
              {author?.name || "User"}
            </span>
            {isInstructorPost && (
              <Badge bg="primary" style={{ fontSize: "0.65rem" }}>
                Instructor
              </Badge>
            )}
            <span className="text-body" style={{ opacity: 0.4, fontSize: "0.78rem" }}>
              {formatDate(createdAt)}
            </span>

            {isMyPost && (
              <button
                className="btn btn-link p-0 text-body text-decoration-none ms-auto"
                style={{ opacity: 0.25 }}
                onClick={() => onDelete(id)}
                disabled={submitting}
                title="Delete reply"
              >
                <BsTrash size={12} />
              </button>
            )}
          </div>

          <div
            className="ql-editor p-0"
            style={{ fontSize: "0.875rem" }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
}
