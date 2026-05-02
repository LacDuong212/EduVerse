import { useMemo } from "react";

const clamp = (n) => Math.max(0, Math.min(100, Number(n) || 0));

const SkillRadarCompareText = ({ radar }) => {
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

        let tone = "neutral";
        let note = "Equal system average.";

        if (diff > 0) {
          tone = "good";
          note = `Above the system average by ${diff}%.`;
        } else if (diff < 0) {
          tone = "bad";
          note =
            diff <= -10
              ? `Below the system average by ${Math.abs(
                diff
              )}%. You should focus on improving this skill.`
              : `Below the system average by ${Math.abs(diff)}%.`;
        }

        return { label, my, avg, diff, tone, note };
      })
      .filter((r) => !(r.my === 0 && r.avg === 0));
  }, [radar]);

  if (!rows.length) return null;

  return (
    <div className="mt-3 p-3 border rounded bg-transparent">
      <div className="fw-bold  mb-2">Skill Comparison</div>
      <div className="d-flex flex-column gap-2">
        {rows.map((r) => (
          <div key={r.label} className="small text-body">
            <span className="fw-semibold">{r.label}</span>:{" "}
            <span>You {r.my}%</span>{" "}
            <span>• System {r.avg}%</span>{" "}
            <span
              className={
                r.tone === "good"
                  ? "text-success fw-semibold"
                  : r.tone === "bad"
                    ? "text-danger fw-semibold"
                    : "text-muted"
              }
            >
              • {r.note}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillRadarCompareText;
