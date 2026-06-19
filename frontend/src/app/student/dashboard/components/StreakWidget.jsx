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

  const current = streak.currentStreak ?? 0;
  const longest = streak.longestStreak ?? 0;
  const next = getNextMilestone(current);
  const progress = next ? Math.min(100, Math.round((current / next) * 100)) : 100;
  const todayCount = streak.activityLog?.[todayYMD()] ?? 0;

  return (
    <div className="border rounded p-3 d-flex flex-column gap-2">
      <div className="fw-bold text-body mb-1">Learning Streak</div>

      <div className="d-flex align-items-center gap-3">
        <div
          className="d-flex align-items-center justify-content-center rounded-circle bg-warning bg-opacity-15 flex-shrink-0"
          style={{ width: 52, height: 52, fontSize: 26 }}
        >
          🔥
        </div>
        <div>
          <div className="fw-bold lh-1" style={{ fontSize: "1.75rem" }}>
            {current}
            <span className="fs-6 fw-normal text-body ms-1">
              {current === 1 ? "day" : "days"}
            </span>
          </div>
          <div className="small text-body">current streak</div>
        </div>

        {todayCount > 0 && (
          <div
            className="ms-auto text-end flex-shrink-0"
          >
            <div className="fw-bold lh-1 text-success" style={{ fontSize: "1.1rem" }}>
              {todayCount}
            </div>
            <div className="small text-body" style={{ fontSize: "0.72rem" }}>
              lecture{todayCount > 1 ? "s" : ""} today
            </div>
          </div>
        )}
      </div>

      {next && (
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
        </div>
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
