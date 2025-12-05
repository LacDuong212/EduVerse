// src/components/StreakBadge.jsx
import { useEffect, useMemo } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaFire } from "react-icons/fa";

// Helper format YYYY-MM-DD
function formatYMD(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const StreakBadge = ({ streak, loading }) => {
  // 🔥 inject CSS animation cho icon (chỉ 1 lần)
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (!document.getElementById("streak-fire-anim-style")) {
      const style = document.createElement("style");
      style.id = "streak-fire-anim-style";
      style.innerHTML = `
        @keyframes fire-bounce {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .fire-anim {
          animation: fire-bounce 1.2s ease-in-out infinite;
          transform-origin: center;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // 🔢 luôn chuẩn bị data trước, KHÔNG return trước khi gọi hooks
  const current = streak?.currentStreak ?? 0;
  const longest = streak?.longestStreak ?? 0;
  const activeDates = Array.isArray(streak?.activeDates)
    ? streak.activeDates
    : [];
  const todayDone = !!streak?.todayDone;

  // 7 ngày gần nhất (từ hôm nay lùi 6 ngày)
  const days = useMemo(() => {
    const arr = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = formatYMD(d);
      arr.push({
        dateStr,
        label: dayLabels[d.getDay()],
        active: activeDates.includes(dateStr),
        today: i === 0,
      });
    }

    return arr;
  }, [activeDates]);

  // Tooltip
  const tooltip = (
    <Tooltip id="streak-tooltip">
      <div>
        🔥 Current: <b>{current}</b> day{current !== 1 ? "s" : ""} <br />
        🏆 Longest: <b>{longest}</b> day{longest !== 1 ? "s" : ""} <br />
        {todayDone ? "Today completed ✔" : "Today not completed"}
      </div>
    </Tooltip>
  );

  // Sau khi gọi hooks xong mới return
  if (loading) {
    return <span className="text-muted small">Loading streak...</span>;
  }

  if (!streak) return null;

  return (
    <OverlayTrigger placement="bottom" overlay={tooltip}>
      <div style={{ cursor: "pointer", userSelect: "none" }}>
        {/* HEADER */}
        <div className="d-flex align-items-center mb-1">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle me-2"
            style={{
              width: 34,
              height: 34,
              background: "rgba(255, 100, 100, 0.15)",
            }}
          >
            <FaFire size={18} color="#ff4d4d" className="fire-anim" />
          </div>

          <div className="d-flex flex-column">
            <span className="fw-bold ">Streak</span>
            <strong className="small">{current} day streak</strong>
          </div>
        </div>

        {/* WEEK CALENDAR */}
        <div className="d-flex" style={{ gap: "8px" }}>
          {days.map((d) => (
            <div
              key={d.dateStr}
              className="d-flex flex-column align-items-center justify-content-center rounded-circle"
              style={{
                width: 32,
                height: 32,
                fontSize: "0.7rem",
                background: d.active ? "#ff4d4d" : "#e9ecef",
                color: d.active ? "white" : "#adb5bd",
                boxShadow: "none", // không viền hôm nay
              }}
              title={`${d.label} - ${d.dateStr} ${
                d.active ? "(learned)" : ""
              }`}
            >
              {d.label}
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="d-flex justify-content-between mt-1 small">
          <span className="text-muted">
            Longest: {longest} day{longest !== 1 ? "s" : ""}
          </span>

          {todayDone ? (
            <span className="text-success fw-semibold">Today ✔</span>
          ) : (
            <span className="text-muted">Today</span>
          )}
        </div>
      </div>
    </OverlayTrigger>
  );
};

export default StreakBadge;
