import { useCallback, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { FaStar } from "react-icons/fa";
import axios from "axios";

const LABELS = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent" };

const MODAL_STYLES = `
  @keyframes ratingStarBounce {
    0%   { transform: scale(1); }
    35%  { transform: scale(1.38); }
    65%  { transform: scale(0.88); }
    85%  { transform: scale(1.06); }
    100% { transform: scale(1); }
  }
  @keyframes ratingSpinnerSpin {
    to { transform: rotate(360deg); }
  }
  @media (prefers-reduced-motion: reduce) {
    .rating-modal-star { animation: none !important; transition: none !important; }
  }
`;

const RatingModal = ({ show, onHide, courseId }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [rating,      setRating]      = useState(0);
  const [hovered,     setHovered]     = useState(0);
  const [description, setDescription] = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState(null);
  const [success,     setSuccess]     = useState(false);
  const [bouncingSet, setBouncingSet] = useState(new Set());
  const timers = useRef([]);

  const active = hovered || rating;

  const triggerBounce = useCallback((n) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setBouncingSet(new Set());
    for (let i = 0; i < n; i++) {
      const t = setTimeout(() => {
        setBouncingSet((prev) => new Set([...prev, i]));
        const clear = setTimeout(() => {
          setBouncingSet((prev) => { const s = new Set(prev); s.delete(i); return s; });
        }, 420);
        timers.current.push(clear);
      }, i * 50);
      timers.current.push(t);
    }
  }, []);

  const handleSelect = (star) => {
    setRating(star);
    setError(null);
    triggerBounce(star);
  };

  const handleSubmit = async () => {
    if (rating === 0) { setError("Please select a star rating."); return; }
    try {
      setSubmitting(true);
      setError(null);
      await axios.post(
        `${backendUrl}/api/reviews`,
        { courseId, rating, description: description.trim() || undefined },
        { withCredentials: true }
      );
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setRating(0);
    setHovered(0);
    setDescription("");
    setError(null);
    setSuccess(false);
    setBouncingSet(new Set());
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static" keyboard={false}>
      <style>{MODAL_STYLES}</style>

      <Modal.Body style={{ padding: "28px 32px 12px" }}>
        {success ? (
          <div className="text-center py-4">
            <div style={{ fontSize: 52, lineHeight: 1, marginBottom: 16 }}>🎉</div>
            <div className="d-flex justify-content-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <FaStar
                  key={i}
                  size={20}
                  style={{ color: i <= rating ? "#FBBF24" : "var(--bs-border-color)" }}
                />
              ))}
            </div>
            <div className="fw-bold text-body mb-2" style={{ fontSize: "1.1rem" }}>
              Rating saved!
            </div>
            <div className="text-body small" style={{ opacity: 0.5, lineHeight: 1.65 }}>
              Thanks for taking the time. Your feedback
              <br />
              helps other learners find great courses.
            </div>
          </div>
        ) : (
          <>
            {/* Headline */}
            <div
              className="fw-bold text-body text-center"
              style={{ fontSize: "1.45rem", letterSpacing: "-0.02em", marginBottom: 28 }}
            >
              How was this course?
            </div>

            {/* Stars */}
            <div
              className="d-flex justify-content-center"
              style={{ gap: 10, marginBottom: 14 }}
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const isLit      = star <= active;
                const isBouncing = bouncingSet.has(star - 1);
                return (
                  <FaStar
                    key={star}
                    className="rating-modal-star"
                    size={48}
                    style={{
                      cursor:     "pointer",
                      color:      isLit ? "#FBBF24" : "var(--bs-border-color, #dee2e6)",
                      filter:     isLit ? "drop-shadow(0 2px 8px rgba(251,191,36,0.5))" : "none",
                      transition: "color 0.13s, filter 0.13s",
                      animation:  isBouncing
                        ? "ratingStarBounce 0.38s cubic-bezier(0.34,1.56,0.64,1) both"
                        : "none",
                      userSelect: "none",
                      flexShrink: 0,
                    }}
                    onClick={() => handleSelect(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                  />
                );
              })}
            </div>

            {/* Label */}
            <div
              className="text-center fw-semibold"
              style={{
                fontSize:     "0.85rem",
                color:        "#F59E0B",
                minHeight:    20,
                opacity:      active ? 1 : 0,
                transition:   "opacity 0.12s",
                marginBottom: 28,
                letterSpacing:"0.01em",
              }}
            >
              {LABELS[active] ?? ""}
            </div>

            {/* Description */}
            <textarea
              rows={3}
              placeholder="What did you enjoy? What could be improved? (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              style={{
                width:       "100%",
                border:      "1.5px solid var(--bs-border-color)",
                borderRadius: 10,
                padding:     "12px 14px",
                fontSize:    "0.875rem",
                fontFamily:  "inherit",
                resize:      "none",
                color:       "var(--bs-body-color)",
                background:  "var(--bs-body-bg)",
                outline:     "none",
                lineHeight:  1.6,
                display:     "block",
                transition:  "border-color 0.15s, box-shadow 0.15s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#FBBF24";
                e.target.style.boxShadow   = "0 0 0 3px rgba(251,191,36,0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--bs-border-color)";
                e.target.style.boxShadow   = "none";
              }}
            />
            <div
              className="text-end text-body small"
              style={{ opacity: 0.35, marginTop: 6, marginBottom: 4 }}
            >
              {description.length} / 500
            </div>

            {error && (
              <div className="small text-danger d-flex align-items-center gap-1 mt-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                {error}
              </div>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer
        style={{
          border:          "none",
          padding:         "12px 32px 28px",
          justifyContent:  success ? "center" : "flex-end",
        }}
      >
        {success ? (
          <button
            onClick={handleClose}
            style={{
              padding:      "10px 40px",
              borderRadius: 10,
              border:       "none",
              background:   "var(--bs-body-color)",
              color:        "var(--bs-body-bg)",
              fontSize:     14,
              fontWeight:   600,
              cursor:       "pointer",
              fontFamily:   "inherit",
            }}
          >
            Done
          </button>
        ) : (
          <div className="d-flex align-items-center gap-2">
            <button
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              style={{
                padding:      "10px 22px",
                borderRadius: 10,
                border:       "none",
                background:   "#F59E0B",
                color:        "#fff",
                fontSize:     14,
                fontWeight:   600,
                cursor:       submitting || rating === 0 ? "not-allowed" : "pointer",
                fontFamily:   "inherit",
                display:      "flex",
                alignItems:   "center",
                gap:          7,
                opacity:      submitting || rating === 0 ? 0.45 : 1,
                boxShadow:    submitting || rating === 0 ? "none" : "0 2px 8px rgba(245,158,11,0.3)",
                transition:   "opacity 0.15s, box-shadow 0.15s",
              }}
            >
              {submitting ? (
                <>
                  <svg
                    width="13" height="13" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                    style={{ animation: "ratingSpinnerSpin 0.7s linear infinite" }}
                  >
                    <path d="M21 12a9 9 0 1 1-9-9" />
                  </svg>
                  Saving…
                </>
              ) : (
                <>
                  <FaStar size={12} />
                  Save rating
                </>
              )}
            </button>
          </div>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default RatingModal;
