const MILESTONE_LABELS = [
  3, 5, 7, 10, 14, 21, 30, 40, 50, 60, 75, 90, 100, 120, 150, 180, 200, 250,
  300, 330, 365,
];

const getNextMilestone = (current) =>
  MILESTONE_LABELS.find((m) => m > current) ?? null;

function todayYMD() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const StreakWidget = ({ streak }) => {
  if (!streak) return null;

  const current    = streak.currentStreak ?? 0;
  const longest    = streak.longestStreak ?? 0;
  const next       = getNextMilestone(current);
  const progress   = next ? Math.min(100, Math.round((current / next) * 100)) : 100;
  const todayCount = streak.activityLog?.[todayYMD()] ?? 0;

  return (
    <div className="border rounded p-3 d-flex flex-column gap-2">
      <div className="d-flex align-items-center justify-content-between mb-1">
        <div className="fw-bold text-body">Streak Milestones</div>
        <span
          className="badge bg-warning bg-opacity-15 text-body"
          style={{ fontSize: "0.72rem" }}
        >
          🔥 Day {current}
        </span>
      </div>

      {todayCount > 0 && (
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-15 text-success flex-shrink-0"
            style={{ width: 30, height: 30, fontSize: 13 }}
          >
            ✓
          </div>
          <div>
            <div className="fw-semibold text-body lh-1" style={{ fontSize: "0.88rem" }}>
              {todayCount} lecture{todayCount > 1 ? "s" : ""} today
            </div>
            <div className="text-body" style={{ fontSize: "0.72rem", opacity: 0.5 }}>
              streak active
            </div>
          </div>
        </div>
      )}

      {next ? (
        <div>
          <div className="d-flex justify-content-between small text-body mb-1">
            <span>Next milestone: {next} days</span>
            <span>{current} / {next}</span>
          </div>
          <div className="progress" style={{ height: 6 }}>
            <div
              className="progress-bar bg-warning"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <div className="small text-body mt-1" style={{ opacity: 0.45 }}>
            {next - current} more {next - current === 1 ? "day" : "days"} to go
          </div>
        </div>
      ) : (
        current > 0 && (
          <div className="text-body small" style={{ opacity: 0.6 }}>
            All milestones reached! 🏆
          </div>
        )
      )}

      {longest > 0 && (
        <div className="d-flex align-items-center gap-2 pt-1 border-top mt-1">
          <span className="text-body small">🏆 Best streak:</span>
          <span className="fw-semibold small text-body">
            {longest} {longest === 1 ? "day" : "days"}
          </span>
        </div>
      )}
    </div>
  );
};

export default StreakWidget;
