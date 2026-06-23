import { useState } from "react";
import { BsCheckCircleFill, BsXCircleFill, BsLightbulb } from "react-icons/bs";

const OVERLAY_STYLE = {
  position: "absolute",
  inset: 0,
  zIndex: 100,
  background: "rgba(0,0,0,0.88)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
};

const CARD_STYLE = {
  background: "#fff",
  borderRadius: "12px",
  padding: "1.5rem",
  maxWidth: "540px",
  width: "100%",
  boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
};

export default function QuizOverlay({ quiz, index, total, onAnswer, onContinue }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = submitted ? selected === quiz.correctAnswer : null;

  const handleSelect = (opt) => {
    if (submitted) return;
    setSelected(opt);
  };

  const handleSubmit = () => {
    if (!selected || submitted) return;
    setSubmitted(true);
    onAnswer(index, selected);
  };

  const getOptionStyle = (opt) => {
    const base = {
      width: "100%",
      padding: "0.6rem 1rem",
      border: "1.5px solid #dee2e6",
      borderRadius: "8px",
      textAlign: "left",
      cursor: submitted ? "default" : "pointer",
      background: "transparent",
      color: "#212529",
      fontWeight: 500,
      transition: "all 0.15s",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "0.5rem",
    };

    if (submitted) {
      if (opt === quiz.correctAnswer)
        return { ...base, background: "rgba(25,135,84,0.1)", border: "2px solid #198754", color: "#198754" };
      if (opt === selected)
        return { ...base, background: "rgba(220,53,69,0.1)", border: "2px solid #dc3545", color: "#dc3545" };
      return { ...base, color: "#adb5bd", border: "1.5px solid #e9ecef" };
    }

    if (opt === selected)
      return { ...base, background: "rgba(13,110,253,0.08)", border: "2px solid #0d6efd", color: "#0d6efd" };

    return base;
  };

  return (
    <div style={OVERLAY_STYLE}>
      <div style={CARD_STYLE}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.1rem", marginRight: "0.5rem" }}>🧠</span>
          <span style={{ fontWeight: 700, fontSize: "1rem" }}>Quick Check</span>
          <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "#6c757d", background: "#f1f3f5", borderRadius: "20px", padding: "2px 10px" }}>
            {index + 1} / {total}
          </span>
        </div>

        {/* Question */}
        <p style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "1.25rem", lineHeight: 1.5 }}>
          {quiz.question}
        </p>

        {/* Options */}
        <div style={{ marginBottom: "1rem" }}>
          {(quiz.options || []).map((opt, i) => (
            <button key={i} onClick={() => handleSelect(opt)} style={getOptionStyle(opt)}>
              <span>{opt}</span>
              {submitted && opt === quiz.correctAnswer && (
                <BsCheckCircleFill style={{ flexShrink: 0, marginLeft: 8 }} />
              )}
              {submitted && opt === selected && opt !== quiz.correctAnswer && (
                <BsXCircleFill style={{ flexShrink: 0, marginLeft: 8 }} />
              )}
            </button>
          ))}
        </div>

        {/* Explanation */}
        {submitted && quiz.explanation && (
          <div style={{
            background: "#f0f7ff",
            border: "1px solid #b8daff",
            borderRadius: "8px",
            padding: "0.75rem 1rem",
            marginBottom: "1rem",
            fontSize: "0.85rem",
            display: "flex",
            gap: "0.5rem",
            alignItems: "flex-start",
          }}>
            <BsLightbulb style={{ color: "#0d6efd", flexShrink: 0, marginTop: 2 }} />
            <div><strong>Explanation: </strong>{quiz.explanation}</div>
          </div>
        )}

        {/* Action */}
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selected}
            style={{
              width: "100%",
              padding: "0.65rem",
              background: selected ? "#0d6efd" : "#e9ecef",
              color: selected ? "#fff" : "#6c757d",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: selected ? "pointer" : "not-allowed",
              fontSize: "0.9rem",
              transition: "all 0.15s",
            }}
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={onContinue}
            style={{
              width: "100%",
              padding: "0.65rem",
              background: "#198754",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Continue Watching →
          </button>
        )}
      </div>
    </div>
  );
}
