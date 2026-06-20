const CATEGORY_COLORS = {
  streak:      "#f0b429",
  completion:  "#0dcaf0",
  performance: "#6f42c1",
};

function formatCondition(condition) {
  if (!condition) return "";
  const { type, threshold } = condition;
  switch (type) {
    case "streak_current":     return `${threshold}-day streak`;
    case "streak_longest":     return `Best streak: ${threshold} days`;
    case "lectures_total":     return `${threshold} lectures completed`;
    case "courses_total":      return `${threshold} course${threshold > 1 ? "s" : ""} finished`;
    case "quiz_perfect_count": return `${threshold} perfect quiz score${threshold > 1 ? "s" : ""}`;
    case "ai_score":           return `AI score ≥ ${threshold}`;
    case "fast_finish":        return `Finish a course in ${threshold} days`;
    default:                   return "";
  }
}

function formatProgressValue(condition, value) {
  if (!condition) return String(value);
  const { type } = condition;
  switch (type) {
    case "streak_current":
    case "streak_longest":     return `${value} day${value !== 1 ? "s" : ""}`;
    case "lectures_total":     return `${value} lecture${value !== 1 ? "s" : ""}`;
    case "courses_total":      return `${value} course${value !== 1 ? "s" : ""}`;
    case "quiz_perfect_count": return `${value} perfect`;
    default:                   return String(value);
  }
}

const STAT_ROWS = [
  { key: "streakCurrent", label: "Current streak", suffix: "days", icon: "🔥" },
  { key: "streakLongest", label: "Longest streak", suffix: "days", icon: null },
  { key: "lecturesTotal", label: "Lectures done",  suffix: null,   icon: null },
  { key: "coursesTotal",  label: "Courses finished", suffix: null, icon: null },
  { key: "perfectCount",  label: "Perfect quizzes",  suffix: null, icon: null },
];

const AchievementSummary = ({ earned, locked, stats }) => {
  const total   = earned.length + locked.length;
  const pct     = total > 0 ? earned.length / total : 0;
  const ringDeg = Math.round(pct * 360);

  // Pick the locked badge closest to completion (highest current/max ratio)
  const nextBadge =
    [...locked]
      .filter((b) => b.progress && b.progress.max > 0)
      .sort((a, b) => (b.progress.current / b.progress.max) - (a.progress.current / a.progress.max))[0]
    ?? locked[0]
    ?? null;

  const progress    = nextBadge?.progress ?? null;
  const progressPct = progress
    ? Math.min(100, Math.round((progress.current / progress.max) * 100))
    : 0;
  const accentColor = CATEGORY_COLORS[nextBadge?.category] ?? "#f0b429";

  return (
    <div className="d-flex flex-column gap-3">

      {/* Progress ring card */}
      <div className="border rounded p-3 d-flex flex-column align-items-center gap-2">
        <div
          aria-label={`${earned.length} of ${total} badges earned`}
          style={{
            width:          96,
            height:         96,
            borderRadius:   "50%",
            background:     `conic-gradient(#f0b429 0deg ${ringDeg}deg, var(--bs-border-color) ${ringDeg}deg 360deg)`,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width:          68,
              height:         68,
              borderRadius:   "50%",
              background:     "var(--bs-body-bg, #fff)",
              display:        "flex",
              flexDirection:  "column",
              alignItems:     "center",
              justifyContent: "center",
              lineHeight:     1,
            }}
          >
            <span style={{ fontSize: 24, fontWeight: 700, color: "#f0b429" }}>
              {earned.length}
            </span>
            <span className="text-body" style={{ fontSize: 11, opacity: 0.55 }}>
              / {total}
            </span>
          </div>
        </div>

        <div className="text-center">
          <div className="fw-semibold text-body small">badges earned</div>
          {total > 0 && (
            <div className="text-body" style={{ fontSize: 11, opacity: 0.45 }}>
              {Math.round(pct * 100)}% complete
            </div>
          )}
        </div>
      </div>

      {/* Stats card */}
      {stats && (
        <div className="border rounded p-3">
          <div
            className="text-body mb-2"
            style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.5 }}
          >
            Your stats
          </div>
          {STAT_ROWS.map(({ key, label, suffix, icon }) => {
            const val = stats[key] ?? 0;
            return (
              <div
                key={key}
                className="d-flex align-items-center justify-content-between py-1"
                style={{ borderBottom: "1px solid var(--bs-border-color)" }}
              >
                <span className="small text-body" style={{ opacity: 0.65 }}>{label}</span>
                <span className="fw-semibold small text-body">
                  {val}{suffix ? ` ${suffix}` : ""}
                  {icon && val > 0 && (
                    <span className="ms-1" style={{ fontSize: 12 }}>{icon}</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Next milestone card */}
      {nextBadge && (
        <div
          className="border rounded p-3"
          style={{ borderTopColor: accentColor, borderTopWidth: 2 }}
        >
          <div
            className="text-body mb-2"
            style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.5 }}
          >
            Next milestone
          </div>

          <div className="d-flex align-items-center gap-2 mb-3">
            <span style={{ fontSize: 28 }}>{nextBadge.icon}</span>
            <div>
              <div className="fw-semibold text-body small">{nextBadge.name}</div>
              <div className="text-body" style={{ fontSize: 11, opacity: 0.5 }}>
                {formatCondition(nextBadge.condition)}
              </div>
            </div>
          </div>

          {progress ? (
            <div>
              <div className="progress" style={{ height: 5 }}>
                <div
                  className="progress-bar"
                  style={{ width: `${progressPct}%`, background: accentColor }}
                  role="progressbar"
                  aria-valuenow={progress.current}
                  aria-valuemin={0}
                  aria-valuemax={progress.max}
                />
              </div>
              <div
                className="d-flex justify-content-between small text-body mt-1"
                style={{ opacity: 0.45 }}
              >
                <span>{formatProgressValue(nextBadge.condition, progress.current)}</span>
                <span>{formatProgressValue(nextBadge.condition, progress.max)}</span>
              </div>
            </div>
          ) : (
            <div className="text-body" style={{ fontSize: 11, opacity: 0.4 }}>
              {formatCondition(nextBadge.condition)}
            </div>
          )}
        </div>
      )}

      {/* Category legend */}
      <div className="border rounded p-3">
        <div
          className="text-body mb-2"
          style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.5 }}
        >
          Categories
        </div>
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <div key={cat} className="d-flex align-items-center gap-2 mb-1">
            <span
              style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }}
            />
            <span className="text-body small" style={{ textTransform: "capitalize" }}>
              {cat}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AchievementSummary;
