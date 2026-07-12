import { useState } from "react";
import { Badge } from "react-bootstrap";
import { sanitizeHtml } from "@/utils/sanitize";
import "react-quill-new/dist/quill.snow.css";
import {
  BsCheckCircle,
  BsChevronDown,
  BsChevronUp,
  BsCameraVideo,
  BsPersonCircle,
  BsTrash,
} from "react-icons/bs";
import QnaCompose from "./QnaCompose";
import QnaReply from "./QnaReply";

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

export default function QnaQuestion({
  question,
  lectureLabel,
  onReply,
  onDelete,
  onDeleteReply,
  onToggleResolve,
  submitting,
}) {
  const {
    id,
    content,
    author,
    isInstructorPost,
    isMyPost,
    isResolved,
    replies = [],
    createdAt,
  } = question;

  const [showReplies, setShowReplies] = useState(false);
  const [showReplyCompose, setShowReplyCompose] = useState(false);

  const handleReplySubmit = async (text) => {
    const success = await onReply(id, { content: text });
    if (success) {
      setShowReplyCompose(false);
      setShowReplies(true);
    }
    return success;
  };

  const borderClass = isResolved
    ? "border-success"
    : isInstructorPost
      ? "border-info"
      : "";

  return (
    <div
      className={`border rounded-3 p-3 position-relative ${borderClass} mt-3`}
      style={
        isResolved
          ? { background: "rgba(var(--bs-success-rgb), 0.03)" }
          : isInstructorPost
            ? { background: "rgba(var(--bs-info-rgb), 0.03)" }
            : undefined
      }
    >
      {/* ── Top-right actions ── */}
      {(isMyPost || isInstructorPost) && (
        <div className="position-absolute top-0 end-0 p-3 d-flex align-items-center gap-2">
          <button
            className={`btn btn-link p-0 text-decoration-none mb-0 ${isResolved ? "text-success" : "text-body"
              }`}
            onClick={() => onToggleResolve(id)}
            title={isResolved ? "Mark unresolved" : "Mark resolved"}
          >
            <BsCheckCircle size={16} />
          </button>

          {isMyPost && (
            <button
              className="btn btn-link p-0 text-danger opacity-75 text-decoration-none mb-0"
              onClick={() => onDelete(id)}
              disabled={submitting}
              title="Delete question"
            >
              <BsTrash size={16} />
            </button>
          )}
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
            {isResolved && (
              <Badge
                bg="success"
                className="d-flex align-items-center gap-1"
                style={{ fontSize: "0.68rem" }}
              >
                <BsCheckCircle size={10} /> Resolved
              </Badge>
            )}
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap mt-1">
            <span className="text-body" style={{ opacity: 0.6, fontSize: "0.78rem" }}>
              {formatDate(createdAt)}
            </span>
            {lectureLabel && (
              <div className="border border-secondary bg-light rounded-2 p-1 pb-0">
                <span
                  className="d-inline-flex align-items-center gap-2 text-body"
                  style={{ opacity: 0.7, fontSize: "0.78rem" }}
                >
                  <BsCameraVideo size={14} className="flex-shrink-0" /> {lectureLabel}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div
        className="ql-editor p-0 mb-3"
        style={{ fontSize: "0.9rem" }}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
      />

      {/* ── Action row ── */}
      <div
        className="d-flex align-items-center gap-2 pt-2"
        style={{ borderTop: "1px solid var(--bs-border-color)" }}
      >
        <button
          className="btn btn-link p-0 text-primary text-decoration-none mb-0"
          style={{ fontSize: "0.82rem" }}
          onClick={() => {
            setShowReplyCompose((v) => !v);
            if (!showReplies && replies.length > 0) setShowReplies(true);
          }}
        >
          Reply
        </button>

        {replies.length > 0 && (
          <button
            className="btn btn-link p-0 text-body text-decoration-none d-flex align-items-center gap-1 mb-0"
            style={{ opacity: 0.55, fontSize: "0.82rem" }}
            onClick={() => setShowReplies((v) => !v)}
          >
            {showReplies ? <BsChevronUp size={11} /> : <BsChevronDown size={11} />}
            {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </button>
        )}
      </div>

      {/* ── Thread ── */}
      {(showReplies || showReplyCompose) && (
        <div
          className="mt-2 ms-1 vstack gap-2"
          style={{
            borderLeft: "2px solid var(--bs-border-color)",
            marginLeft: 8,
            paddingLeft: 20,
          }}
        >
          {showReplies &&
            replies.map((reply) => (
              <QnaReply
                key={reply.id}
                reply={reply}
                onDelete={(rid) => onDeleteReply(rid, id)}
                submitting={submitting}
              />
            ))}

          {showReplyCompose && (
            <div className="pt-1">
              <QnaCompose
                submitLabel="Post Reply"
                onSubmit={handleReplySubmit}
                onCancel={() => setShowReplyCompose(false)}
                disabled={submitting}
                placeholder="Write a reply…"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
