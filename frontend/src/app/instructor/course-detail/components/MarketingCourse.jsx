import { formatCurrency } from '@/utils/currency';
import { Alert, Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const MarketingCourse = ({ col = 6, courseData }) => {
  const statusBadge =
    courseData?.status === "Live"
      ? "success"
      : courseData?.status === "Pending"
        ? "warning"
        : courseData?.status === "Rejected"
          ? "orange"
          : courseData?.status === "Blocked"
            ? "danger"
            : "secondary";

  // #TODO: more fallback

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
            <h5 className="card-header-title">{courseData?.title || '(No title)'}</h5>
          </CardHeader>
          <CardBody className="p-3 pb-2">
            <Row>
              <Col md={6} className="d-flex">
                <div
                  className="ratio ratio-1x1 w-100"
                  style={{ maxHeight: '300px' }}
                >
                  <img
                    src={
                      courseData?.image ||
                      courseData?.thumbnail ||
                      "https://res.cloudinary.com/dw1fjzfom/image/upload/v1757337425/av4_khpvlh.png"
                    }
                    alt={courseData?.title || "Course Image"}
                    className="rounded w-100 h-100 object-fit-cover"
                  />
                </div>
              </Col>
              <Col md={6}>
                <h5>Short Description</h5>
                <p className="mb-3">{courseData?.subtitle || '(No short description)'}</p>
                <h5>Full Description</h5>
                <div className="mb-3">
                  {courseData?.description
                    ? <div
                      className="clamped-html"
                      dangerouslySetInnerHTML={{ __html: courseData.description }}
                    />
                    : '(No full description)'}
                </div>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col md={6}>
                <ul className="list-group list-group-borderless">
                  <li className="list-group-item">
                    <span>Category:</span>
                    <span className="h6 mb-0">{courseData?.category || ''}</span>
                  </li>
                  <li className="list-group-item">
                    <span>Subcategory:</span>
                    <span className="h6 mb-0">{courseData?.subCategory || '(Not specified)'}</span>
                  </li>
                  <li className="list-group-item">
                    <span>Language:</span>
                    <span className="h6 mb-0">{courseData?.language || ""}</span>
                  </li>
                  <li className="list-group-item">
                    <span>Status:</span>
                    <div
                      className={`badge bg-${statusBadge} bg-opacity-10 text-${statusBadge} fs-6`}
                    >
                      {courseData?.status || "N/A"}
                    </div>
                  </li>
                  <li className="list-group-item">
                    <span>Price:</span>
                    <span className="h6 mb-0">
                      {courseData?.price === 0 ? (
                        <div className="badge bg-success bg-opacity-10 text-success fs-6">Free</div>
                      ) : courseData?.enableDiscount ? (
                        <>
                          {formatCurrency(courseData?.discountPrice)}{" "}
                          <span className="text-secondary text-decoration-line-through">
                            {formatCurrency(courseData?.price)}
                          </span>
                        </>
                      ) : (
                        formatCurrency(courseData?.price)
                      )}
                    </span>
                  </li>
                  <li className="list-group-item">
                    <span>Created At:</span>
                    <span className="h6 mb-0">
                      {courseData?.createdAt
                        ? new Date(courseData?.createdAt).toLocaleString("en-GB", {
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
                      {courseData?.createdAt
                        ? new Date(courseData?.createdAt).toLocaleString("en-GB", {
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
              <Col md={6}>
                <ul className="list-group list-group-borderless">
                  <li className="list-group-item">
                    <span>Level:</span>
                    <span className="h6 mb-0">{courseData?.level || '(Not specified)'}</span>
                  </li>
                  <li className="list-group-item">
                    <span>Duration:</span>
                    <span className="h6 mb-0">{courseData?.duration + 'h' || 'N/A'}</span>
                  </li>
                  <li className="list-group-item">
                    <span>Total Lectures:</span>
                    <span className="h6 mb-0">{courseData?.lecturesCount || 0}</span>
                  </li>
                  <li className="list-group-item">
                    <span>Average Rating:</span>
                    <span className="h6 mb-0">
                      {courseData?.rating?.average || 0}
                      <FaStar className="text-warning ms-1 mb-1" />
                    </span>
                  </li>
                  <li className="list-group-item">
                    <span>Student Enrolled:</span>
                    <span className="h6 mb-0">{courseData?.studentsEnrolled || 0}</span>
                  </li>
                  <li className="list-group-item">
                    <span>Tags:</span>
                    {(courseData?.tags || []).map(tag =>
                      <Link
                        key={`tag-${courseData?._id}-${tag}`}
                        to={`/courses?tags=${encodeURIComponent(tag)}`}
                        className="badge bg-secondary bg-opacity-10 text-secondary mb-1 me-1 text-decoration-none"
                      >
                        {tag}
                      </Link>
                    )}
                  </li>
                </ul>
              </Col>
              {(courseData?.isPrivate) && (
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

export default MarketingCourse;
