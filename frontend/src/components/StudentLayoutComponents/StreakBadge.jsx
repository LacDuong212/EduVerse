import { useEffect } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaFire } from "react-icons/fa";

const StreakBadge = ({ streak, loading }) => {
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

  const current  = streak?.currentStreak ?? 0;
  const longest  = streak?.longestStreak ?? 0;
  const todayDone = !!streak?.todayDone;

  const tooltip = (
    <Tooltip id="streak-tooltip">
      <div>
        🔥 Current: <b>{current}</b> day{current !== 1 ? "s" : ""}<br />
        🏆 Longest: <b>{longest}</b> day{longest !== 1 ? "s" : ""}<br />
        {todayDone ? "Today completed ✔" : "Today not completed"}
      </div>
    </Tooltip>
  );

  if (loading) return <span className="text-body small" style={{ opacity: 0.5 }}>Loading...</span>;
  if (!streak) return null;

  return (
    <OverlayTrigger placement="bottom" overlay={tooltip}>
      <div
        className="d-flex align-items-center gap-2"
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        <div
          className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
          style={{ width: 34, height: 34, background: "rgba(255, 100, 100, 0.15)" }}
        >
          <FaFire size={18} color="#ff4d4d" className="fire-anim" />
        </div>
        <div className="d-flex flex-column lh-1">
          <span className="fw-bold" style={{ fontSize: "0.85rem" }}>Streak</span>
          <span className="fw-semibold" style={{ fontSize: "0.78rem" }}>
            {current} day{current !== 1 ? "s" : ""}
            {todayDone && (
              <span className="text-success ms-1">✔</span>
            )}
          </span>
        </div>
      </div>
    </OverlayTrigger>
  );
};

export default StreakBadge;
