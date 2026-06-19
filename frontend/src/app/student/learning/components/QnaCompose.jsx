import { useState } from "react";
import { Button } from "react-bootstrap";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const MAX_CHARS = 5000;

const QUILL_MODULES = {
  toolbar: [
    ["bold", "italic", "underline", "strike"],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

const QUILL_FORMATS = [
  "bold", "italic", "underline", "strike",
  "blockquote", "code-block",
  "list",
  "link",
];

const isEmptyHtml = (html) => !html?.replace(/<[^>]*>/g, "").trim();

export default function QnaCompose({
  placeholder = "Write your question...",
  submitLabel = "Post Question",
  onSubmit,
  disabled = false,
  onCancel,
}) {
  const [value, setValue] = useState("");
  const [charCount, setCharCount] = useState(0);

  // react-quill-new onChange: (html, delta, source, editor)
  const handleChange = (html, _delta, _source, editor) => {
    // getLength() includes Quill's trailing newline, subtract 1
    const len = Math.max(0, editor.getLength() - 1);
    setCharCount(len);
    setValue(html);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEmptyHtml(value) || charCount > MAX_CHARS) return;

    const success = await onSubmit(value);
    if (success) {
      setValue("");
      setCharCount(0);
    }
  };

  const isOverLimit = charCount > MAX_CHARS;

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-1" style={{ minHeight: 120 }}>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={handleChange}
          modules={QUILL_MODULES}
          formats={QUILL_FORMATS}
          placeholder={placeholder}
          readOnly={disabled}
        />
      </div>

      <div className="d-flex align-items-center justify-content-between mt-2">
        <span
          className={`small ${isOverLimit ? "text-danger fw-semibold" : "text-body opacity-50"}`}
        >
          {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </span>

        <div className="d-flex gap-2">
          {onCancel && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={onCancel}
              disabled={disabled}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={disabled || isEmptyHtml(value) || isOverLimit}
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
