import { Link } from "react-router-dom";

function barColor(pct) {
  if (pct >= 75) return "bg-success";
  if (pct >= 40) return "bg-warning";
  return "bg-info";
}

const CloseToCompletion = ({ courses }) => {
  if (!courses?.length) return null;

  const sorted = [...courses]
    .sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))
    .slice(0, 3);

  const topPct = sorted[0]?.percentage ?? 0;
  const title = topPct >= 50 ? "Almost there!" : "Keep going!";

  return (
    <div className="border rounded p-3 d-flex flex-column gap-2">
      <div className="fw-bold text-body mb-1">{title}</div>
      {sorted.map((course) => (
        <CourseRow key={course.courseId} course={course} />
      ))}
    </div>
  );
};

const CourseRow = ({ course }) => {
  const { courseId, title, percentage = 0, completedLectures = 0, totalLectures = 0 } = course;

  return (
    <Link
      to={`/student/courses/${courseId}`}
      className="text-decoration-none"
    >
      <div className="rounded p-2 d-flex flex-column gap-1"
        style={{ background: "var(--bs-tertiary-bg, rgba(0,0,0,0.03))", transition: "background 0.15s" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bs-secondary-bg, rgba(0,0,0,0.06))")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bs-tertiary-bg, rgba(0,0,0,0.03))")}
      >
        <div
          className="small fw-semibold text-body lh-sm"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </div>

        <div className="d-flex align-items-center gap-2 mt-1">
          <div className="progress flex-grow-1" style={{ height: 5 }}>
            <div
              className={`progress-bar ${barColor(percentage)}`}
              style={{ width: `${percentage}%`, transition: "width 0.4s ease" }}
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <span className="small text-body fw-semibold flex-shrink-0" style={{ minWidth: 32, textAlign: "right" }}>
            {percentage}%
          </span>
        </div>

        <div className="small text-body" style={{ opacity: 0.55 }}>
          {completedLectures} / {totalLectures} lectures
        </div>
      </div>
    </Link>
  );
};

export default CloseToCompletion;
