import { Link } from "react-router-dom";
import { useAchievements } from "@/app/student/achievements/useAchievements";

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
    case "streak_longest":     return `${threshold}-day best streak`;
    case "lectures_total":     return `${threshold} lectures`;
    case "courses_total":      return `${threshold} course${threshold > 1 ? "s" : ""}`;
    case "quiz_perfect_count": return `${threshold} perfect quiz${threshold > 1 ? "zes" : ""}`;
    case "ai_score":           return `AI score ≥ ${threshold}`;
    case "fast_finish":        return `Finish in ${threshold} days`;
    default:                   return "";
  }
}

const BadgesWidget = () => {
  const { earned, locked, loading } = useAchievements();

  if (loading) return null;
  if (!earned.length && !locked.length) return null;

  const total        = earned.length + locked.length;
  const recentEarned = [...earned]
    .sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt))
    .slice(0, 8);
  const nextBadge  = locked[0] ?? null;
  const percentage = total > 0 ? Math.round((earned.length / total) * 100) : 0;

  return (
    <div className="bg-transparent border rounded-3 p-3 d-flex flex-column gap-2">

      {/* Header */}
      <div className="d-flex align-items-center justify-content-between">
        <div className="fw-bold text-body">Badges</div>
        <Link
          to="/student/achievements"
          className="small text-body"
          style={{ opacity: 0.78, textDecoration: "none" }}
        >
          View all →
        </Link>
      </div>

      {/* Count + progress bar */}
      <div>
        <div className="d-flex align-items-baseline gap-1 mb-1">
          <span className="fw-bold text-body lh-1" style={{ fontSize: "1.25rem" }}>
            {earned.length}
          </span>
          <span className="text-body small">/ {total} earned</span>
        </div>
        {total > 0 && (
          <div className="progress" style={{ height: 4 }}>
            <div
              className="progress-bar"
              style={{ width: `${percentage}%`, background: "#f0b429" }}
              role="progressbar"
              aria-valuenow={earned.length}
              aria-valuemin={0}
              aria-valuemax={total}
            />
          </div>
        )}
      </div>

      {/* Badge circles */}
      <div className="d-flex flex-wrap gap-2 pt-1">
        {recentEarned.length > 0 ? (
          <>
            {recentEarned.map((badge) => {
              const color = CATEGORY_COLORS[badge.category] ?? "#f0b429";
              return (
                <div
                  key={badge.key}
                  title={badge.name}
                  style={{
                    width:          38,
                    height:         38,
                    borderRadius:   "50%",
                    background:     `${color}18`,
                    border:         `1.5px solid ${color}`,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    fontSize:       17,
                    boxShadow:      `0 0 6px ${color}28`,
                    flexShrink:     0,
                  }}
                >
                  {badge.icon}
                </div>
              );
            })}
            {earned.length > 8 && (
              <span className="text-body small align-self-center" style={{ opacity: 0.78 }}>
                +{earned.length - 8}
              </span>
            )}
          </>
        ) : (
          <span className="text-body small" style={{ opacity: 0.78 }}>
            Complete your first lecture to earn a badge.
          </span>
        )}
      </div>

      {/* Next up */}
      {nextBadge && (
        <div className="d-flex align-items-center gap-2 pt-2 mt-1 border-top">
          <span style={{ fontSize: 22, filter: "grayscale(1) brightness(0.65)", flexShrink: 0 }}>
            {nextBadge.icon}
          </span>
          <div>
            <div
              className="text-body"
              style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.78 }}
            >
              Next up
            </div>
            <div className="fw-semibold text-body small">{nextBadge.name}</div>
            <div className="text-body" style={{ fontSize: 11, opacity: 0.78 }}>
              {formatCondition(nextBadge.condition)}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BadgesWidget;
