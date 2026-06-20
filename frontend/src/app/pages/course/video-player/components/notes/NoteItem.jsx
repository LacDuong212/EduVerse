import { memo, useState } from "react";
import { Badge, Button, Form, Spinner } from "react-bootstrap";
import { BsPencil, BsTrash } from "react-icons/bs";
import TagInput from "./TagInput";

const formatTimestamp = (seconds) => {
  const t = Math.max(0, Math.floor(seconds));
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const NoteItem = memo(function NoteItem({ note, isActive, onSeek, onEdit, onDelete, submitting }) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [editTags, setEditTags] = useState(note.tags ?? []);

  const handleSave = async () => {
    const ok = await onEdit(note.id, { content: editContent.trim(), tags: editTags });
    if (ok) setEditing(false);
  };

  const handleCancel = () => {
    setEditContent(note.content);
    setEditTags(note.tags ?? []);
    setEditing(false);
  };

  const handleStartEdit = () => {
    setEditContent(note.content);
    setEditTags(note.tags ?? []);
    setEditing(true);
  };

  return (
    <div
      className={`rounded-2 p-2 mb-2 border ${isActive ? "border-primary" : "border-light"}`}
      style={isActive ? { backgroundColor: "#eef0fd" } : undefined}
    >
      {/* Timestamp + actions row */}
      <div className="d-flex align-items-center justify-content-between mb-1">
        <button
          className="btn btn-sm btn-outline-primary py-0 px-2 mb-0 fw-semibold flex-shrink-0"
          style={{ fontSize: 12, lineHeight: "20px" }}
          onClick={() => onSeek(note.timestamp)}
          title="Jump to this moment"
        >
          {formatTimestamp(note.timestamp)}
        </button>

        {!editing && (
          <div className="d-flex gap-2 ms-2">
            <button
              className="btn btn-link btn-sm p-0 mb-0 text-body opacity-50"
              onClick={handleStartEdit}
              title="Edit"
            >
              <BsPencil size={16} />
            </button>
            <button
              className="btn btn-link btn-sm p-0 mb-0 text-danger"
              onClick={() => onDelete(note.id)}
              title="Delete"
            >
              <BsTrash size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Content / Edit form */}
      {editing ? (
        <>
          <Form.Control
            as="textarea"
            rows={3}
            size="sm"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            maxLength={5000}
            autoFocus
          />
          <div className="mt-2">
            <TagInput tags={editTags} onChange={setEditTags} />
          </div>
          <div className="d-flex align-items-center justify-content-between mt-2">
            <span className="text-body opacity-50" style={{ fontSize: 11 }}>
              {editContent.length} / 5000
            </span>
            <div className="d-flex gap-2">
              <Button size="sm" variant="light" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleSave}
                disabled={submitting || !editContent.trim()}
              >
                {submitting ? <Spinner size="sm" animation="border" /> : "Save"}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <p
          className="mb-0 small text-body"
          style={{ lineHeight: 1.55, whiteSpace: "pre-wrap", overflowWrap: "break-word", wordBreak: "break-word", cursor: "pointer" }}
          onClick={() => onSeek(note.timestamp)}
        >
          {note.content}
        </p>
      )}

      {/* Tags (view mode only) */}
      {!editing && note.tags?.length > 0 && (
        <div className="d-flex flex-wrap gap-1 mt-2">
          {note.tags.map((tag) => (
            <Badge key={tag} bg="light" text="dark" className="fw-normal border" style={{ fontSize: 10 }}>
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
});

export default NoteItem;
