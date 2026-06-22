import { useState } from "react";
import { BsX } from "react-icons/bs";

export default function TagInput({ tags, onChange, maxTags = 10, disabled }) {
  const [input, setInput] = useState("");

  const commit = () => {
    const val = input.trim().toLowerCase().slice(0, 50);
    if (val && !tags.includes(val) && tags.length < maxTags) {
      onChange([...tags, val]);
    }
    setInput("");
  };

  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag));

  return (
    <div>
      {tags.length > 0 && (
        <div className="d-flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="d-inline-flex align-items-center gap-1 border rounded-pill ps-2 pe-1 me-0"
              style={{ fontSize: 12}}
            >
              <strong>#</strong> {tag}
              {!disabled && (
                <button
                  type="button"
                  className="btn mb-0 p-0 d-flex align-items-center opacity-75"
                  onClick={() => removeTag(tag)}
                >
                  <BsX size={18} color="red" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
      {!disabled && tags.length < maxTags && (
        <input
          type="text"
          className="form-control form-control-sm mt-2"
          placeholder="Add tag (Enter or comma)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            }
          }}
          onBlur={commit}
          maxLength={50}
        />
      )}
    </div>
  );
}
