import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { DEFAULT_COURSE_IMG } from "@/contexts/constants";

function timeAgoLabel(iso) {
  if (!iso) return null;
  const diffMs  = Date.now() - new Date(iso).getTime();
  const diffDay = Math.floor(diffMs / 86_400_000);
  if (diffDay === 0) return null;
  if (diffDay === 1) return "Picking up from yesterday";
  if (diffDay < 7)  return `Picking up from ${diffDay} days ago`;
  if (diffDay < 30) return `Picking up from last week`;
  return `Picking up from ${Math.floor(diffDay / 30)} month${Math.floor(diffDay / 30) > 1 ? "s" : ""} ago`;
}

const ResumeCard = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${backendUrl}/api/student/resume`, { withCredentials: true })
      .then((res) => setData(res?.data?.result || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [backendUrl]);

  if (loading || !data) return null;

  const {
    courseId,
    courseTitle,
    thumbnail,
    lectureId,
    lectureTitle,
    percentage   = 0,
    completedLectures = 0,
    totalLectures     = 0,
    lastActivityAt,
  } = data;

  const resumePath = lectureId
    ? `/student/courses/${courseId}/watch/${lectureId}`
    : `/student/courses/${courseId}`;

  const ageLabel = timeAgoLabel(lastActivityAt);

  return (
    <div className="border rounded overflow-hidden mb-4">
      <div className="d-flex align-items-stretch">
        {/* Thumbnail */}
        <div className="flex-shrink-0" style={{ width: 140 }}>
          <img
            src={thumbnail || DEFAULT_COURSE_IMG}
            alt={courseTitle}
            onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_COURSE_IMG; }}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", minHeight: 100 }}
          />
        </div>

        {/* Content */}
        <div className="p-3 d-flex flex-column gap-1 flex-grow-1 min-w-0">
          {/* Header row */}
          <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
            <span
              className="text-body"
              style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", opacity: 0.45 }}
            >
              Continue where you left off
            </span>
            <span
              className="badge bg-primary bg-opacity-75"
              style={{ fontSize: "0.68rem" }}
            >
              {percentage}%
            </span>
          </div>

          {/* Course title */}
          <div
            className="fw-bold text-body lh-sm"
            style={{
              fontSize:            "0.9rem",
              display:             "-webkit-box",
              WebkitLineClamp:     2,
              WebkitBoxOrient:     "vertical",
              overflow:            "hidden",
            }}
            title={courseTitle}
          >
            {courseTitle}
          </div>

          {/* Lecture title */}
          {lectureTitle && (
            <div
              className="small text-body"
              style={{
                opacity:             0.65,
                display:             "-webkit-box",
                WebkitLineClamp:     1,
                WebkitBoxOrient:     "vertical",
                overflow:            "hidden",
              }}
              title={lectureTitle}
            >
              {lectureTitle}
            </div>
          )}

          {/* Progress text + age label */}
          <div className="d-flex align-items-center gap-2 flex-wrap mt-auto pt-1">
            <span className="small text-body" style={{ opacity: 0.55 }}>
              {completedLectures} / {totalLectures} lectures
            </span>
            {ageLabel && (
              <span className="small text-body" style={{ opacity: 0.4, fontStyle: "italic" }}>
                · {ageLabel}
              </span>
            )}
          </div>

          {/* CTA */}
          <div className="mt-1">
            <Link
              to={resumePath}
              className="btn btn-primary btn-sm"
              style={{ width: "fit-content" }}
            >
              Resume →
            </Link>
          </div>
        </div>
      </div>

      {/* Full-width progress bar */}
      <div style={{ height: 4, background: "var(--bs-border-color)" }}>
        <div
          className="bg-primary"
          style={{ height: "100%", width: `${percentage}%`, transition: "width 0.4s ease" }}
        />
      </div>
    </div>
  );
};

export default ResumeCard;
