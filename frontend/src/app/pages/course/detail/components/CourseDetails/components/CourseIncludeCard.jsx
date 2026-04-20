import { Card } from "react-bootstrap";
import { FaBook, FaClock, FaGlobe, FaSignal } from "react-icons/fa";
import { secondsToDurationHM } from "@/utils/duration";

const CourseIncludeCard = ({ course }) => {
  const lecturesCount = course?.lecturesCount || 0;
  const duration = course?.duration !== null ? secondsToDurationHM(course?.duration) : "--";
  const level = course?.level || "all";
  const language = course?.language || "others";
  
  return (
    <Card className="card-body shadow p-3">
      <h4 className="mb-3">This course includes</h4>
      <ul className="list-group list-group-borderless">
        <li className="list-group-item d-flex justify-content-between align-items-center">
          <span className="h6 fw-light mb-0">
            <FaBook className="fa-fw text-primary me-1" />
            Lectures
          </span>
          <span>{lecturesCount}</span>
        </li>
        <li className="list-group-item d-flex justify-content-between align-items-center">
          <span className="h6 fw-light mb-0">
            <FaClock className="fa-fw text-primary me-1" />
            Duration
          </span>
          <span>{duration}</span>
        </li>
        <li className="list-group-item d-flex justify-content-between align-items-center">
          <span className="h6 fw-light mb-0">
            <FaSignal className="fa-fw text-primary me-1" />
            Level
          </span>
          <span className="text-capitalize">{level}</span>
        </li>
        <li className="list-group-item d-flex justify-content-between align-items-center">
          <span className="h6 fw-light mb-0">
            <FaGlobe className="fa-fw text-primary me-1" />
            Language
          </span>
          <span className="text-capitalize">{language}</span>
        </li>
      </ul>
    </Card>
  );
};

export default CourseIncludeCard;