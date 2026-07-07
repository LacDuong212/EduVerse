// Quick-reply chips. `suggestions` is an array of { label, query }.
export default function SuggestionChips({ suggestions, onSelect, disabled }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="d-flex flex-wrap gap-2 mt-2">
      {suggestions.map((s, i) => (
        <button
          key={i}
          type="button"
          className="btn btn-sm btn-outline-primary rounded-pill mb-0 py-1 px-3"
          style={{ fontSize: "0.8rem" }}
          disabled={disabled}
          onClick={() => onSelect?.(s.query)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
