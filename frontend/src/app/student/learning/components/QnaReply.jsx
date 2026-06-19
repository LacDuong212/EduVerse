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
      className="d-flex gap-2 p-2 rounded-2"
      style={isInstructorPost ? { backgroundColor: "#F9F9D6" } : undefined}
    >
      <div className="flex-shrink-0 mt-1">
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
          <BsPersonCircle size={28} className="text-body" />
        )}
      </div>

      <div className="flex-grow-1 min-w-0">
        <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
          <span className="fw-semibold small">{author?.name || "User"}</span>
          {isInstructorPost && (
            <Badge bg="primary" className="small">
              Instructor
            </Badge>
          )}
          <span className="text-body small opacity-50">{formatDate(createdAt)}</span>

          {isMyPost && (
            <button
              className="btn btn-link btn-sm text-danger p-0 ms-auto"
              onClick={() => onDelete(id)}
              disabled={submitting}
              title="Delete reply"
            >
              <BsTrash size={13} />
            </button>
          )}
        </div>

        <div
          className="mb-0 small ql-editor p-0"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}
