import { Link } from "react-router-dom";
import { FaGraduationCap, FaCompass, FaChartLine, FaFire } from "react-icons/fa";

const STEPS = [
  {
    icon: <FaCompass size={20} />,
    title: "Browse courses",
    text: "Explore the catalog and find topics that match your goals.",
  },
  {
    icon: <FaGraduationCap size={20} />,
    title: "Start learning",
    text: "Enroll and complete lectures to make progress at your pace.",
  },
  {
    icon: <FaChartLine size={20} />,
    title: "Track your skills",
    text: "Your Skill Radar fills in as you complete courses.",
  },
  {
    icon: <FaFire size={20} />,
    title: "Build a streak",
    text: "Learn a little every day to grow your activity streak.",
  },
];

const DashboardEmptyState = () => {
  return (
    <div className="border rounded p-4 p-md-5 mb-4 text-center">
      <div
        className="rounded-circle d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary mb-3"
        style={{ width: 64, height: 64 }}
      >
        <FaGraduationCap size={30} />
      </div>

      <h4 className="fw-bold text-body mb-1">Welcome! Let&apos;s get you started</h4>
      <p className="text-body mb-4">
        You haven&apos;t enrolled in any courses yet. Enroll in your first course
        to start tracking your skills, progress, and learning streak.
      </p>

      <div className="row g-3 text-start mb-4">
        {STEPS.map((step) => (
          <div className="col-12 col-md-6 col-xl-3" key={step.title}>
            <div className="border rounded p-3 h-100 d-flex flex-column gap-2">
              <div className="text-primary">{step.icon}</div>
              <div className="fw-semibold text-body small">{step.title}</div>
              <div className="small text-body">{step.text}</div>
            </div>
          </div>
        ))}
      </div>

      <Link to="/courses" className="btn btn-primary px-4">
        Browse Courses
      </Link>
    </div>
  );
};

export default DashboardEmptyState;
