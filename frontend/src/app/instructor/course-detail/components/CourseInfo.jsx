import { Fragment } from "react";
import { Alert, Card, CardBody, CardHeader, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { DEFAULT_COURSE_IMG } from "@/contexts/constants";
import { formatCurrency } from "@/utils/currency";
import { secondsToDurationHM } from "@/utils/duration";
import { sanitizeHtml } from "@/utils/sanitize";

const CourseInfo = ({ col = 6, course }) => {
  const statusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === "live") return "success";
    if (s === "pending") return "warning";
    if (s === "draft") return "info";
    if (s === "rejected") return "orange";
    if (s === "blocked") return "danger";
    return "secondary";
  };

  const badge = statusBadge(course?.status);

  return (
    <>
      <style>
        {`.clamped-html {
          display: -webkit-box;
          -webkit-line-clamp: 5;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }`}
      </style>
      <Col xxl={col}>
        <Card className="bg-transparent border rounded-3 h-100">
          <CardHeader className="bg-light border-bottom">
            <h5 className="card-header-title">Course Info</h5>
          </CardHeader>
          <CardBody className="p-3 pb-2">
            <Row>
              <Col md={6} className="d-flex mb-2">
                <div
                  className="ratio ratio-1x1 w-100"
                  style={{ maxHeight: "300px" }}
                >
                  <img
                    src={course?.image || course?.thumbnail || DEFAULT_COURSE_IMG}
                    alt={course?.title || "Course Image"}
                    className="rounded w-100 h-100 object-fit-cover"
                    onError={(e) => e.target.src = DEFAULT_COURSE_IMG}
                  />
                </div>
              </Col>
              <Col md={6}>
                <h5>Short Description</h5>
                <p className="mb-2">{course?.subtitle || "(No short description)"}</p>
                <h5>Full Description</h5>
                <div className="mb-3">
                  {course?.description
                    ? <div
                      className="clamped-html"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(course.description) }}
                    />
                    : "(No full description)"}
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <ul className="list-group list-group-borderless">
                  <li className="list-group-item">
                    <span>Category:</span>
                    {course?.cateId ? (
                      <Link
                        to={`/courses?category=${encodeURIComponent(course?.cateId || "")}`}
                        className="fw-bold"
                      >
                        {course?.cateName || "(Not specified)"}
                      </Link>
                    ) : (
                      <span className="h6 mb-0">{course?.cateName || "(Not specified)"}</span>
                    )}
                  </li>
                  <li className="list-group-item">
                    <span>Language:</span>
                    <span className="h6 mb-0 text-capitalize">{course?.language || ""}</span>
                  </li>
                  <li className="list-group-item">
                    <span>Level:</span>
                    <span className="h6 mb-0 text-capitalize">{course?.level || "(Not specified)"}</span>
                  </li>
                  <li className="list-group-item">
                    <span>Price:</span>
                    <span className="h6 mb-0">
                      {course?.price === 0 ? (
                        <div className="badge bg-success bg-opacity-10 text-success fs-6">Free</div>
                      ) : course?.enableDiscount ? (
                        <>
                          {formatCurrency(course?.discountPrice)}
                          <span className="ms-2 fw-light text-decoration-line-through">
                            {formatCurrency(course?.price)}
                          </span>
                        </>
                      ) : (
                        formatCurrency(course?.price)
                      )}
                    </span>
                  </li>
                  <li className="list-group-item">
                    <span>Status:</span>
                    <div
                      className={`badge bg-${badge} bg-opacity-10 text-${badge} fs-6`}
                    >
                      {course?.status?.toUpperCase() || "N/A"}
                    </div>
                  </li>
                  <li className="list-group-item">
                    <span className="me-1">Tags:</span>
                    {(course?.tags || []).map((tag, idx) => (
                      <Fragment key={`tag-${course?.courseId}-${tag || idx}`}>
                        <Link
                          to={`/courses?search=${encodeURIComponent(tag || "")}`}
                          className="d-inline-block text-truncate text-decoration-underline align-bottom"
                          style={{ maxWidth: "150px" }}
                          title={tag}
                        >
                          {tag}
                        </Link>
                        {idx !== (course?.tags?.length - 1) ? ", " : ""}
                      </Fragment>
                    ))}
                  </li>
                </ul>
              </Col>
              <Col md={6}>
                <ul className="list-group list-group-borderless">
                  <li className="list-group-item">
                    <span>Duration:</span>
                    <span className="h6 mb-0">{secondsToDurationHM(course?.duration) || "N/A"}</span>
                  </li>
                  <li className="list-group-item">
                    <span>Total Sections:</span>
                    <span className="h6 mb-0">{course?.sectionsCount || 0}</span>
                  </li>
                  <li className="list-group-item">
                    <span>Total Lectures:</span>
                    <span className="h6 mb-0">{course?.lecturesCount || 0}</span>
                  </li>
                  <li className="list-group-item">
                    <span>Average Rating:</span>
                    <span className="h6 mb-0">
                      {course?.ratingCount > 0 ? (course?.ratingTotal/course?.ratingCount)?.toFixed(1) : 0}
                    </span>
                  </li>
                  <li className="list-group-item">
                    <span>Student Enrolled:</span>
                    <span className="h6 mb-0">{course?.studentsEnrolled || 0}</span>
                  </li>
                  <li className="list-group-item">
                    <span>Created At:</span>
                    <span className="h6 mb-0">
                      {course?.createdAt
                        ? new Date(course?.createdAt).toLocaleString("en-GB", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                        : "N/A"}
                    </span>
                  </li>
                  <li className="list-group-item">
                    <span>Updated At:</span>
                    <span className="h6 mb-0">
                      {course?.updatedAt
                        ? new Date(course?.updatedAt).toLocaleString("en-GB", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                        : "N/A"}
                    </span>
                  </li>
                </ul>
              </Col>
              {(course?.isPrivate && course?.status === "live") && (
                <Col>
                  <Alert className="mb-2" variant="info">
                    This course is currently private. Students who have purchased this course still have full access to all materials.
                  </Alert>
                </Col>
              )}
            </Row>
          </CardBody>
        </Card>
      </Col>
    </>
  );
};

export default CourseInfo;