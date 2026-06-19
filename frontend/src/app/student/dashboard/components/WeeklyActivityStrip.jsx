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

const WeeklyActivityStrip = ({ streak }) => {
  const activeDates = streak?.activeDates ?? [];
  const currentStreak = streak?.currentStreak ?? 0;

  const { days, daysThisWeek, activatedToday } = useMemo(() => {
    const activeSet = new Set(activeDates);
    const today = new Date();
    const todayStr = formatYMD(today);

    // Build the 7-day window: Mon–Sun of the current week (Mon = start)
    const dayOfWeek = today.getDay(); // 0=Sun
    // Shift so week starts on Monday: Mon=0..Sun=6
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = formatYMD(d);
      const isPast = d <= today;
      return {
        label: DAY_LABELS[d.getDay()],
        dateStr,
        active: activeSet.has(dateStr),
        isToday: dateStr === todayStr,
        isFuture: d > today,
        isPast,
      };
    });

    const daysThisWeek = days.filter((d) => d.active).length;
    const activatedToday = activeSet.has(todayStr);

    return { days, daysThisWeek, activatedToday };
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
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: day.active
                  ? "var(--bs-primary, #0d6efd)"
                  : day.isFuture
                  ? "transparent"
                  : "var(--bs-border-color, rgba(0,0,0,0.1))",
                border: day.isToday
                  ? "2px solid var(--bs-primary, #0d6efd)"
                  : day.isFuture
                  ? "2px dashed var(--bs-border-color, rgba(0,0,0,0.2))"
                  : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                transition: "background 0.2s",
              }}
            >
              {day.active ? "✓" : ""}
            </div>
            <span
              style={{
                fontSize: 10,
                color: day.isToday
                  ? "var(--bs-primary, #0d6efd)"
                  : "var(--bs-secondary-color, #6c757d)",
                fontWeight: day.isToday ? 700 : 400,
              }}
            >
              {day.label}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div
        className="d-none d-sm-block flex-shrink-0"
        style={{ width: 1, height: 40, background: "var(--bs-border-color, rgba(0,0,0,0.12))" }}
      />

      {/* Message */}
      <div className="d-flex flex-column gap-1">
        <div className="fw-semibold text-body" style={{ fontSize: "0.9rem" }}>
          {message}
        </div>
        <div className="small text-body">
          {daysThisWeek === 0
            ? "No activity this week yet."
            : `Active ${daysThisWeek} of 7 days this week`}
          {currentStreak > 0 && (
            <span className="ms-2">
              🔥 <strong>{currentStreak}</strong> day streak
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyActivityStrip;
