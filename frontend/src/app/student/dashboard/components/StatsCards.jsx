import { FaBookOpen, FaCheckCircle, FaSpinner, FaLayerGroup } from "react-icons/fa";
import { Row, Col } from "react-bootstrap";

const CARDS = [
  {
    key: "enrolled",
    label: "Total Enrolled",
    icon: <FaBookOpen size={22} />,
    colorClass: "text-primary",
    bgClass: "bg-primary bg-opacity-10",
  },
  {
    key: "completed",
    label: "Completed",
    icon: <FaCheckCircle size={22} />,
    colorClass: "text-success",
    bgClass: "bg-success bg-opacity-10",
  },
  {
    key: "inProgress",
    label: "In Progress",
    icon: <FaSpinner size={22} />,
    colorClass: "text-warning",
    bgClass: "bg-warning bg-opacity-10",
  },
  {
    key: "lectures",
    label: "Lectures Done",
    icon: <FaLayerGroup size={22} />,
    colorClass: "text-info",
    bgClass: "bg-info bg-opacity-10",
  },
];

const StatsCards = ({ stats, courseStats }) => {
  const getValue = (key) => {
    if (key === "enrolled") return courseStats?.totalCourses ?? stats?.totalCourses ?? "—";
    if (key === "completed") return courseStats?.totalCompleted ?? stats?.completedCourses ?? "—";
    if (key === "inProgress") return courseStats?.totalInProgress ?? "—";
    if (key === "lectures") {
      const done = stats?.completedLectures;
      const total = stats?.totalLectures;
      if (done == null) return "—";
      return total ? `${done} / ${total}` : String(done);
    }
    return "—";
  };

  const getLecturesProgress = () => {
    const done = stats?.completedLectures;
    const total = stats?.totalLectures;
    if (!done || !total) return null;
    return Math.round((done / total) * 100);
  };

  return (
    <Row className="g-3">
      {CARDS.map((card) => {
        const progress = card.key === "lectures" ? getLecturesProgress() : null;
        return (
          <Col xs={6} xl={3} key={card.key}>
            <div className="bg-transparent border rounded-3 p-3 h-100 d-flex align-items-center gap-3">
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${card.bgClass} ${card.colorClass}`}
                style={{ width: 46, height: 46 }}
              >
                {card.icon}
              </div>
              <div className="min-w-0 flex-grow-1">
                <div className="fw-bold fs-5 text-body lh-1 mb-1">
                  {getValue(card.key)}
                </div>
                <div className="small text-body">{card.label}</div>
                {progress !== null && (
                  <div className="progress mt-2" style={{ height: 4 }}>
                    <div
                      className="progress-bar bg-info"
                      style={{ width: `${progress}%` }}
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                )}
              </div>
            </div>
          </Col>
        );
      })}
    </Row>
  );
};

export default StatsCards;
