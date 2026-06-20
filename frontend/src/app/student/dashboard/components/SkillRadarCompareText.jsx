import { useMemo } from "react";
import { Link } from "react-router-dom";

const clamp = (n) => Math.max(0, Math.min(100, Number(n) || 0));

const SkillRadarCompareText = ({ radar }) => {
  const totalActiveLearners = radar?.raw?.totalActiveLearners ?? 0;

  const rows = useMemo(() => {
    const labels = Array.isArray(radar?.labels) ? radar.labels : [];
    const values = Array.isArray(radar?.values) ? radar.values : [];
    const sys = Array.isArray(radar?.systemAvgValues) ? radar.systemAvgValues : [];

    if (!labels.length) return [];

    return labels
      .map((label, i) => {
        const my = clamp(values[i] ?? 0);
        const avg = clamp(sys[i] ?? 0);
        const diff = my - avg;
        return { label, my, avg, diff };
      })
      .filter((r) => !(r.my === 0 && r.avg === 0));
  }, [radar]);

  const strengths = useMemo(
    () => rows.filter((r) => r.diff > 0).sort((a, b) => b.diff - a.diff).slice(0, 3),
    [rows]
  );

  // Only show focus areas where system avg is meaningful (≥10%) to avoid noise
  const focusAreas = useMemo(
    () => rows.filter((r) => r.diff < 0 && r.avg >= 10).sort((a, b) => a.diff - b.diff).slice(0, 3),
    [rows]
  );

  if (!rows.length || (!strengths.length && !focusAreas.length)) return null;

  return (
    <div className="p-3 border rounded bg-transparent">
      <div className="fw-bold mb-3 text-body">Skill Comparison</div>

      <div className="d-flex flex-column gap-3">
        {strengths.length > 0 && (
          <div>
            <div className="small fw-semibold text-body mb-2" style={{ opacity: 0.6 }}>
              Above average
            </div>
            <div className="d-flex flex-wrap gap-2">
              {strengths.map((r) => (
                <span
                  key={r.label}
                  className="badge rounded-pill"
                  style={{
                    background: "var(--bs-success-bg-subtle, #d1e7dd)",
                    color: "var(--bs-success-text-emphasis, #0a3622)",
                    border: "1px solid var(--bs-success-border-subtle, #a3cfbb)",
                    fontSize: "0.78rem",
                    padding: "0.35em 0.75em",
                    fontWeight: 500,
                  }}
                >
                  {r.label} &nbsp;+{r.diff}%
                </span>
              ))}
            </div>
          </div>
        )}

        {focusAreas.length > 0 && (
          <div>
            <div className="small fw-semibold text-body mb-2" style={{ opacity: 0.6 }}>
              Focus areas — tap to browse courses
            </div>
            <div className="d-flex flex-wrap gap-2">
              {focusAreas.map((r) => (
                <Link
                  key={r.label}
                  to={`/courses?category=${encodeURIComponent(r.label)}`}
                  className="badge rounded-pill text-decoration-none"
                  style={{
                    background: "var(--bs-danger-bg-subtle, #f8d7da)",
                    color: "var(--bs-danger-text-emphasis, #842029)",
                    border: "1px solid var(--bs-danger-border-subtle, #f1aeb5)",
                    fontSize: "0.78rem",
                    padding: "0.35em 0.75em",
                    fontWeight: 500,
                  }}
                >
                  {r.label} &nbsp;{r.diff}%
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {totalActiveLearners > 0 && (
        <div className="small text-muted mt-3">
          Compared to {totalActiveLearners} active learner{totalActiveLearners !== 1 ? "s" : ""} on EduVerse
        </div>
      )}
    </div>
  );
};

export default SkillRadarCompareText;
