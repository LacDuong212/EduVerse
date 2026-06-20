import { useMemo } from "react";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMotivationMessage(current, activatedToday, daysThisWeek) {
  if (current === 0) return "Start learning today to begin your streak! 🚀";
  if (activatedToday && current >= 7) return `${current} days strong — you're on fire! 🔥`;
  if (activatedToday) return `Day ${current} done! Keep the momentum going. 💪`;
  if (current >= 30) return `${current}-day streak — don't break the chain! 🏆`;
  if (daysThisWeek >= 5) return `Amazing week! You showed up ${daysThisWeek}/7 days. ⭐`;
  return `${current} day streak — come back today to keep it going! ✨`;
}

// 4-state dot styles:
// active       → primary blue fill, white ✓
// today active → primary fill + outer ring
// today idle   → primary border, light fill (call-to-action: "study now")
// past missed  → grey fill + grey border (clearly seen but skipped)
// future       → faint dashed outline
function getDotStyle(day) {
  if (day.active && day.isToday) {
    return {
      background: "var(--bs-primary, #0d6efd)",
      border:     "none",
      boxShadow:  "0 0 0 3px rgba(13,110,253,0.22)",
    };
  }
  if (day.active) {
    return {
      background: "var(--bs-primary, #0d6efd)",
      border:     "none",
    };
  }
  if (day.isToday) {
    return {
      background: "rgba(13,110,253,0.08)",
      border:     "2px solid var(--bs-primary, #0d6efd)",
    };
  }
  if (day.isFuture) {
    return {
      background: "transparent",
      border:     "1.5px dashed rgba(108,117,125,0.4)",
    };
  }
  // past missed
  return {
    background: "rgba(108,117,125,0.18)",
    border:     "1.5px solid rgba(108,117,125,0.45)",
  };
}

function getLabelStyle(day) {
  if (day.active || day.isToday) {
    return { color: "var(--bs-primary, #0d6efd)", fontWeight: 700 };
  }
  if (day.isFuture) return { opacity: 0.3 };
  return { opacity: 0.55 };
}

const WeeklyActivityStrip = ({ streak }) => {
  const activeDates   = streak?.activeDates ?? [];
  const currentStreak = streak?.currentStreak ?? 0;

  const { days, daysThisWeek, activatedToday } = useMemo(() => {
    const activeSet = new Set(activeDates);
    const today     = new Date();
    const todayStr  = formatYMD(today);

    const dayOfWeek    = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday       = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const days = Array.from({ length: 7 }, (_, i) => {
      const d       = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = formatYMD(d);
      return {
        label:    DAY_LABELS[d.getDay()],
        dateStr,
        active:   activeSet.has(dateStr),
        isToday:  dateStr === todayStr,
        isFuture: d > today,
      };
    });

    return {
      days,
      daysThisWeek:   days.filter((d) => d.active).length,
      activatedToday: activeSet.has(todayStr),
    };
  }, [activeDates]);

  const message = getMotivationMessage(currentStreak, activatedToday, daysThisWeek);

  return (
    <div className="border rounded p-3 mb-4 d-flex flex-column flex-sm-row align-items-center gap-3">
      {/* Day dots */}
      <div className="d-flex gap-2 flex-shrink-0">
        {days.map((day) => (
          <div key={day.dateStr} className="d-flex flex-column align-items-center gap-1">
            <div
              style={{
                width:          36,
                height:         36,
                borderRadius:   "50%",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                fontSize:       15,
                fontWeight:     700,
                color:          day.active ? "#fff" : "transparent",
                transition:     "background 0.2s, box-shadow 0.2s",
                ...getDotStyle(day),
              }}
            >
              {day.active ? "✓" : ""}
            </div>
            <span style={{ fontSize: 10, ...getLabelStyle(day) }}>
              {day.label}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div
        className="d-none d-sm-block flex-shrink-0"
        style={{ width: 1, height: 40, background: "var(--bs-border-color)" }}
      />

      {/* Message */}
      <div className="d-flex flex-column gap-1">
        <div className="fw-semibold text-body" style={{ fontSize: "0.9rem" }}>
          {message}
        </div>
        <div className="small text-body" style={{ opacity: 0.65 }}>
          {daysThisWeek === 0
            ? "No activity this week yet."
            : `Active ${daysThisWeek} of 7 days this week`}
        </div>
      </div>
    </div>
  );
};

export default WeeklyActivityStrip;
