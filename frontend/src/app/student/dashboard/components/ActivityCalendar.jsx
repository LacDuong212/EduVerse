import { useEffect, useMemo, useRef, useState } from "react";

const CELL = 13;
const GAP = 3;
const DAY_LABEL_W = 28;

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const STYLE_ID = "gh-calendar-colors";
const injectPalette = () => {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    :root {
      --gh-c0: #ebedf0;
      --gh-c1: #9be9a8;
      --gh-c2: #40c463;
      --gh-c3: #30a14e;
      --gh-c4: #216e39;
      --gh-today: #0d6efd;
    }
    [data-bs-theme="dark"] {
      --gh-c0: #161b22;
      --gh-c1: #0e4429;
      --gh-c2: #006d32;
      --gh-c3: #26a641;
      --gh-c4: #39d353;
      --gh-today: #58a6ff;
    }
  `;
  document.head.appendChild(s);
};

function formatYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Map daily lecture count → GitHub intensity level color
function countToColor(count) {
  if (count === 0) return "var(--gh-c0)";
  if (count <= 2) return "var(--gh-c1)";
  if (count <= 5) return "var(--gh-c2)";
  if (count <= 9) return "var(--gh-c3)";
  return "var(--gh-c4)";
}

function buildGrid(activeDates, activityLog) {
  const activeSet = new Set(Array.isArray(activeDates) ? activeDates : []);
  const logMap = activityLog && typeof activityLog === "object" ? activityLog : {};

  const today = new Date();
  const todayStr = formatYMD(today);

  const end = new Date(today);
  end.setDate(today.getDate() + (6 - today.getDay()));

  const start = new Date(end);
  start.setDate(end.getDate() - 52 * 7 + 1);

  const weeks = [];
  const monthLabels = [];
  const cursor = new Date(start);
  let weekIdx = 0;

  while (cursor <= end) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = formatYMD(cursor);
      const isPast = cursor <= today;
      // Use activityLog count; fall back to 1 for legacy dates that have
      // activeDates entries but predate activityLog tracking.
      const count = isPast
        ? (logMap[dateStr] ?? (activeSet.has(dateStr) ? 1 : 0))
        : 0;
      week.push({
        date: dateStr,
        count,
        isToday: dateStr === todayStr,
        show: isPast,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    const pivot = week.find((c) => c.show && new Date(c.date).getDate() === 1);
    if (pivot) {
      monthLabels.push({ weekIdx, label: MONTH_NAMES[new Date(pivot.date).getMonth()] });
    }

    weeks.push(week);
    weekIdx++;
  }

  return { weeks, monthLabels };
}

const TIP_W = 140;
const COL_STEP = CELL + GAP;

const ActivityCalendar = ({ streak }) => {
  // Side effect at module boundary — inject once, not during render
  useEffect(() => { injectPalette(); }, []);

  const activeDates = useMemo(() => streak?.activeDates ?? [], [streak]);
  const activityLog = useMemo(() => streak?.activityLog ?? {}, [streak]);
  const totalActive = activeDates.length;
  const { weeks, monthLabels } = useMemo(
    () => buildGrid(activeDates, activityLog),
    [activeDates, activityLog]
  );

  const [tip, setTip] = useState(null);
  const wrapRef = useRef(null);

  const showTip = (e, cell) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    const cellRect = e.currentTarget.getBoundingClientRect();
    const x = cellRect.left - rect.left + CELL / 2;
    const y = cellRect.top - rect.top;
    const label = cell.isToday ? "Today" : cell.date;
    const countText = cell.count > 0
      ? ` — ${cell.count} lecture${cell.count > 1 ? "s" : ""}`
      : "";
    setTip({ text: `${label}${countText}`, x, y });
  };

  // SVG intrinsic dimensions — used in viewBox; SVG scales to 100% container width
  const svgW = DAY_LABEL_W + weeks.length * COL_STEP - GAP;
  const svgH = 14 + 7 * COL_STEP - GAP;

  return (
    <div className="border rounded p-3">
      <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-1">
        <span className="fw-bold text-body" style={{ fontSize: "0.9rem" }}>
          {totalActive} active {totalActive === 1 ? "day" : "days"} in the last year
        </span>
      </div>

      <div
        ref={wrapRef}
        style={{ position: "relative" }}
        onMouseLeave={() => setTip(null)}
      >
        {/* viewBox + width="100%" makes SVG fill container without scroll */}
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          width="100%"
          style={{ display: "block", overflow: "visible" }}
        >
          {/* Month labels */}
          {monthLabels.map(({ weekIdx, label }) => (
            <text
              key={label + weekIdx}
              x={DAY_LABEL_W + weekIdx * COL_STEP}
              y={10}
              style={{ fontSize: 10, fill: "var(--bs-secondary-color, #6c757d)", fontFamily: "inherit" }}
            >
              {label}
            </text>
          ))}

          {/* Day rows: Sun first — matches week array layout (week[0]=Sun) */}
          {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek, rowIdx) => {
            const y = 14 + rowIdx * COL_STEP;
            const showLabel = dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5;
            return (
              <g key={dayOfWeek}>
                {showLabel && (
                  <text
                    x={DAY_LABEL_W - 4}
                    y={y + CELL - 2}
                    textAnchor="end"
                    style={{ fontSize: 9, fill: "var(--bs-secondary-color, #6c757d)", fontFamily: "inherit" }}
                  >
                    {DAY_LABELS[dayOfWeek]}
                  </text>
                )}
                {weeks.map((week, wi) => {
                  const cell = week[dayOfWeek];
                  const cx = DAY_LABEL_W + wi * COL_STEP;
                  const fill = !cell.show
                    ? "transparent"
                    : countToColor(cell.count);

                  return (
                    <rect
                      key={wi}
                      x={cx}
                      y={y}
                      width={CELL}
                      height={CELL}
                      rx={2}
                      ry={2}
                      fill={fill}
                      stroke={cell.isToday ? "var(--gh-today)" : "none"}
                      strokeWidth={cell.isToday ? 1.5 : 0}
                      onMouseEnter={cell.show ? (e) => showTip(e, cell) : undefined}
                      style={{ cursor: cell.show ? "default" : undefined }}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        {tip && (
          <div
            style={{
              position: "absolute",
              top: tip.y - 28,
              // clamp between left edge and right edge
              left: Math.max(
                0,
                Math.min(
                  tip.x - TIP_W / 2,
                  (wrapRef.current?.offsetWidth ?? 300) - TIP_W - 4
                )
              ),
              width: TIP_W,
              background: "rgba(33,37,41,0.92)",
              color: "#fff",
              borderRadius: 4,
              padding: "3px 8px",
              fontSize: 11,
              pointerEvents: "none",
              whiteSpace: "nowrap",
              zIndex: 10,
              textAlign: "center",
            }}
          >
            {tip.text}
          </div>
        )}
      </div>

      <div className="d-flex align-items-center gap-1 mt-2 justify-content-end">
        <span className="small text-body me-1">Less</span>
        {["var(--gh-c0)", "var(--gh-c1)", "var(--gh-c2)", "var(--gh-c3)", "var(--gh-c4)"].map((bg, i) => (
          <div
            key={i}
            style={{ width: 11, height: 11, borderRadius: 2, background: bg, flexShrink: 0 }}
          />
        ))}
        <span className="small text-body ms-1">More</span>
      </div>
    </div>
  );
};

export default ActivityCalendar;
