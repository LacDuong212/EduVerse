import { Link } from "react-router-dom";
import { DEFAULT_COURSE_IMG } from "@/contexts/constants";

const ContinueLearning = ({ courses }) => {
  const started = courses?.filter((c) => (c.percentage ?? 0) > 0) ?? [];
  if (!started.length) return null;

  return (
    <div className="border rounded p-3 mb-4">
      <h6 className="fw-bold text-body mb-3">Continue Learning</h6>
      <div className="d-flex flex-column gap-2">
        {started.map((course) => (
          <ContinueCourseCard key={course.courseId} course={course} />
        ))}
      </div>
    </div>
  );
};

const ContinueCourseCard = ({ course }) => {
  const {
    courseId,
    title,
    thumbnail,
    percentage = 0,
    completedLectures = 0,
    totalLectures = 0,
  } = course;

  const resumePath = `/student/courses/${courseId}`;

  return (
    <div className="border rounded overflow-hidden d-flex align-items-stretch">
      {/* Thumbnail */}
      <div className="position-relative flex-shrink-0" style={{ width: 120 }}>
        <img
          src={thumbnail || DEFAULT_COURSE_IMG}
          alt={title}
          onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_COURSE_IMG; }}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {/* Percentage badge */}
        <div className="position-absolute top-0 end-0 m-1">
          <span
            className="badge bg-primary"
            style={{ fontSize: "0.68rem", padding: "0.2em 0.45em" }}
          >
            {percentage}%
          </span>
        </div>
        {/* Progress bar */}
        <div
          className="position-absolute bottom-0 start-0 end-0"
          style={{ height: 3, background: "rgba(0,0,0,0.2)" }}
        >
          <div
            className="h-100 bg-primary"
            style={{ width: `${percentage}%`, transition: "width 0.4s ease" }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-2 d-flex flex-column gap-1 flex-grow-1 min-w-0">
        <div
          className="small fw-semibold text-body lh-sm"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
          title={title}
        >
          {title}
        </div>
        <div className="small text-body" style={{ opacity: 0.85 }}>
          {completedLectures} / {totalLectures} lectures
        </div>
        <Link to={resumePath} className="btn btn-primary btn-sm mt-auto" style={{ width: "fit-content" }}>
          Resume →
        </Link>
      </div>
    </div>
  );
};

export default ContinueLearning;
