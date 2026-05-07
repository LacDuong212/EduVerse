import { DEFAULT_AVATAR_IMG } from "@/contexts/constants";
import { Card, Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { FaBook, FaCommentDots, FaStar, FaUserGraduate } from "react-icons/fa";
import { Link } from "react-router-dom";

const InstructorTab = ({ instructor = {} }) => {
  const avatar = instructor?.avatar || DEFAULT_AVATAR_IMG;

  const stats = {
    averageRating: (instructor?.stats?.averageRating || 0).toFixed(1),
    totalCourses: instructor?.stats?.totalCourses || 0,
    totalReviews: instructor?.stats?.totalReviews || 0,
    totalStudents: instructor?.stats?.totalStudents || 0,
  };

  return (
    <Card>
      <Row className="align-items-center g-3">
        <Col xs={12} md="auto" className="d-flex justify-content-center">
          <div style={{ width: "160px", height: "160px" }}>
            {avatar ? (
              <img
                src={avatar}
                className="rounded-3 border border-body border-3 shadow h-100 w-100"
                alt="Avatar"
                onError={(e) => e.target.src = DEFAULT_AVATAR_IMG}
              />
            ) : (
              <div className="rounded-3 border border-body border-3 bg-light shadow d-flex justify-content-center align-items-center w-100 h-100 fs-1 fw-bold">
                {(instructor?.name?.[0] || "I").toUpperCase()}
              </div>
            )}
          </div>

        </Col>
        <Col xs={12} md>
          <Link to={`/instructors/${instructor.insId || ""}`} className="fs-3 fw-bold">
            {instructor?.name || "Instructor"}
          </Link>
          <ul className="list-inline mt-2 mb-0">
            <li className="list-inline-item">
              <div className="d-flex align-items-center me-3 mb-2">
                <OverlayTrigger
                  placement="bottom"
                  overlay={<Tooltip>Rating</Tooltip>}
                >
                  <span className="icon-md bg-warning bg-opacity-15 text-warning rounded-circle">
                    <FaStar className="fs-4 p-1 mb-1" />
                  </span>
                </OverlayTrigger>
                <span className="h6 fw-light mb-0 ms-2">{stats?.averageRating}</span>
              </div>

            </li>
            <li className="list-inline-item">
              <div className="d-flex align-items-center me-3 mb-2">
                <OverlayTrigger
                  placement="bottom"
                  overlay={<Tooltip>Courses</Tooltip>}
                >
                  <span className="icon-md bg-danger bg-opacity-10 text-danger rounded-circle">
                    <FaBook className="fs-6 mb-1" />
                  </span>
                </OverlayTrigger>
                <span className="h6 fw-light mb-0 ms-2">{stats?.totalCourses}</span>
              </div>
            </li>
            <li className="list-inline-item">
              <div className="d-flex align-items-center me-3 mb-2">
                <OverlayTrigger
                  placement="bottom"
                  overlay={<Tooltip>Students</Tooltip>}
                >
                  <span className="icon-md bg-orange bg-opacity-10 text-orange rounded-circle">
                    <FaUserGraduate className="fs-6 mb-1" />
                  </span>
                </OverlayTrigger>
                <span className="h6 fw-light mb-0 ms-2">{stats?.totalStudents}</span>
              </div>
            </li>
            <li className="list-inline-item">
              <div className="d-flex align-items-center me-3 mb-2">
                <OverlayTrigger
                  placement="bottom"
                  overlay={<Tooltip>Reviews</Tooltip>}
                >
                  <span className="icon-md bg-info bg-opacity-10 text-info rounded-circle">
                    <FaCommentDots className="fs-4 p-1 mb-1" />
                  </span>
                </OverlayTrigger>
                <span className="h6 fw-light mb-0 ms-2">{stats?.totalReviews}</span>
              </div>
            </li>
          </ul>
        </Col>
      </Row>
    </Card>
  );
};

export default InstructorTab;