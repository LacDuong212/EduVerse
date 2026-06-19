import { useState } from "react";
import { Badge, Button } from "react-bootstrap";
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
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
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

  return (
    <div
      className={`border rounded-2 p-3 mt-3 position-relative ${isInstructorPost ? "border-info" : ""}`}
    >
      {/* Top-right actions */}
      {(isMyPost || isInstructorPost) && (
        <div className="position-absolute top-0 end-0 p-2 d-flex align-items-center gap-2">
          <button
            className={`btn btn-link p-0 text-decoration-none ${
              isResolved ? "text-success" : "text-body opacity-50"
            }`}
            onClick={() => onToggleResolve(id)}
            title={isResolved ? "Mark unresolved" : "Mark resolved"}
          >
            <BsCheckCircle size={18} />
          </button>

          {isMyPost && (
            <button
              className="btn btn-link p-0 text-danger"
              onClick={() => onDelete(id)}
              disabled={submitting}
              title="Delete question"
            >
              <BsTrash size={18} />
            </button>
          )}
        </div>
      )}

      {/* Author row */}
      <div className="d-flex align-items-start gap-2 mb-2">
        <div className="flex-shrink-0 mt-1">
          {author?.avatar ? (
            <img
              src={author.avatar}
              alt={author.name}
              className="rounded-circle"
              width={32}
              height={32}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <BsPersonCircle size={32} className="text-body" />
          )}
        </div>

        <div className="flex-grow-1 min-w-0">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="fw-semibold">{author?.name || "User"}</span>
            {isInstructorPost && (
              <Badge bg="primary">Instructor</Badge>
            )}
            {isResolved && (
              <Badge bg="success" className="d-flex align-items-center gap-1">
                <BsCheckCircle size={11} /> Resolved
              </Badge>
            )}
            <span className="text-body small opacity-50">{formatDate(createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Lecture tag */}
      {lectureLabel && (
        <div className="ms-5 mb-2">
          <span className="badge bg-light text-body border d-inline-flex align-items-center gap-1 fw-normal small">
            <BsCameraVideo size={11} />
            {lectureLabel}
          </span>
        </div>
      )}

      {/* Content */}
      <div
        className="mb-3 ms-5 ql-editor p-0"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Actions */}
      <div className="d-flex align-items-center gap-2 flex-wrap ms-5">
        {replies.length > 0 && (
          <Button
            variant="outline-secondary"
            size="sm"
            className="d-flex align-items-center gap-1"
            onClick={() => setShowReplies((v) => !v)}
          >
            {showReplies ? (
              <>
                <BsChevronUp size={11} /> Hide replies
              </>
            ) : (
              <>
                <BsChevronDown size={11} /> {replies.length}{" "}
                {replies.length === 1 ? "reply" : "replies"}
              </>
            )}
          </Button>
        )}

        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => {
            setShowReplyCompose((v) => !v);
            if (!showReplies) setShowReplies(true);
          }}
        >
          Reply
        </Button>

      </div>

      {/* Replies + compose */}
      {(showReplies || showReplyCompose) && (
        <div className="mt-3 ms-5 vstack gap-2">
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
            <QnaCompose
              submitLabel="Post Reply"
              onSubmit={handleReplySubmit}
              onCancel={() => setShowReplyCompose(false)}
              disabled={submitting}
            />
          )}
        </div>
      )}
    </div>
  );
}
