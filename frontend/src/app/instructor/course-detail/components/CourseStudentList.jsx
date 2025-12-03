import { useCourseStudentList } from '../useMyCourseDetail';
import { useState } from 'react';
import { Card, CardBody, CardFooter, CardHeader, Col, OverlayTrigger, ProgressBar, Row, Tooltip } from 'react-bootstrap';
import { FaAngleLeft, FaAngleRight, FaRegEnvelope, FaRegStar, FaSearch, FaStar, FaStarHalfAlt } from 'react-icons/fa';


const CourseStudentRow = ({ studentData }) => {
  const student = studentData?.student || {};
  const review = studentData?.review || null;
  return (
    <tr>
      <td>
        <div className="d-flex align-items-center position-relative">
          <div className="avatar avatar-md flex-shrink-0">
            {student?.pfpImg ? (
              <img
                src={student?.pfpImg}
                className="rounded-circle"
                alt={'avatar'}
              />
            ) : (
              <div className="avatar-img rounded-circle border-white border-3 shadow d-flex align-items-center justify-content-center bg-light text-dark fw-bold fs-4">
                {(student?.name?.[0] || "S").toUpperCase()}
              </div>
            )}
          </div>
          <div className="mb-0 ms-2">
            <h6 className="mb-0">
              <a href={`/instructor/students/${student?._id}`}>{student?.name}</a>
            </h6>
            <div className="overflow-hidden mt-1">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="small fw-bold">{student?.progress}%</span>
              </div>
              <div style={{ width: '160px' }}>
                <ProgressBar
                  now={student?.progress}
                  className="progress progress-sm bg-opacity-10 w-100"
                  aria-valuenow={student?.progress || 0}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          </div>
        </div>
      </td>
      <td className="text-center">
        {student?.enrolledAt
          ? new Date(student?.enrolledAt).toLocaleString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
          })
          : "N/A"}
      </td>
      <td>
        {review ? (
          <>
            <div className="d-flex flex-wrap align-items-center mb-1">
              <ul className="list-inline mb-0 me-2 d-flex align-items-center">
                {(review?.rating || review?.rating === 0) && (
                  <>
                    {Array(Math.floor(review.rating)).fill(0).map((_star, idx) => (
                      <li key={idx} className="list-inline-item me-1 small">
                        <FaStar size={14} className="text-warning mb-1" />
                      </li>
                    ))}
                    {!Number.isInteger(review.rating) && (
                      <li className="list-inline-item me-1 small">
                        <FaStarHalfAlt size={14} className="text-warning mb-1" />
                      </li>
                    )}
                    {review.rating < 5 &&
                      Array(5 - Math.ceil(review.rating)).fill(0).map((_star, idx) => (
                        <li key={idx} className="list-inline-item me-1 small">
                          <FaRegStar size={14} className="text-warning mb-1" />
                        </li>
                      ))}
                  </>
                )}
              </ul>
              <div className="small mt-0">
                <span className="fw-bold"> • </span>
                {review.updatedAt
                  ? new Date(review.updatedAt).toLocaleString("en-GB", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                  : "N/A"}
              </div>
            </div>
            <div title={review?.description || ''}>
              {review?.description && review.description.length > 100
                ? `${review.description.substring(0, 100)}...`
                : review?.description}
            </div>
          </>
        ) : (
          "-"
        )}
      </td>
      <td className="text-center">
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id={`tooltip-message-${student?._id}`}>Message</Tooltip>}
        >
          <a title="Message" href="#" className="btn btn-success-soft btn-round mb-0 flex-centered" data-bs-toggle="tooltip" data-bs-placement="top">
            <FaRegEnvelope className="far fa-envelope" />
          </a>
        </OverlayTrigger>
      </td>
    </tr>
  );
};

const CourseStudentList = ({ col = 12, courseId = '' }) => {
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [search, setSearch] = useState('');
  const { students, total = 0, totalPages = 0 } = useCourseStudentList(courseId, page, limit, search);
  const start = (page - 1) * limit + 1;
  const end = Math.min(start + students.length - 1, total);

  return (
    <Col xs={col}>
      <Card className="bg-transparent border">
        <CardHeader className="bg-light border-bottom">
          <Row className="align-items-center justify-content-between">
            <Col md={6}>
              <h5 className="mb-0">Student List</h5>
            </Col>
            <Col md={6}>
              <input
                className="form-control"
                type="search"
                placeholder="Search students"
                aria-label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>
          </Row>
        </CardHeader>
        <CardBody className="pb-0">
          <div className="table-responsive border-0">
            <table className="table table-dark-gray align-middle p-4 mb-0 table-hover">
              <thead>
                <tr>
                  <th scope="col" className="border-0 rounded-start">
                    Student Name
                  </th>
                  <th scope="col" className="border-0 text-center">
                    Enrolled At
                  </th>
                  <th scope="col" className="border-0 text-center">
                    Review
                  </th>
                  <th scope="col" className="border-0 text-center rounded-end">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <CourseStudentRow key={idx} studentData={student} />
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
        <CardFooter className="bg-transparent">
          <div className="d-sm-flex justify-content-sm-between align-items-sm-center">
            <p className="mb-0 text-center text-sm-start">
              Showing {total === 0 ? 0 : start} to {end} of {total} students
            </p>
            <nav aria-label="navigation">
              <ul className="pagination pagination-sm pagination-primary-soft d-inline-block d-md-flex rounded mb-0">

                {/* Prev */}
                <li className={`page-item mb-0 ${page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(page - 1)}>
                    <FaAngleLeft />
                  </button>
                </li>

                {/* Pages */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <li key={p} className={`page-item mb-0 ${p === page ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(p)}>{p}</button>
                  </li>
                ))}

                {/* Next */}
                <li className={`page-item mb-0 ${page === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(page + 1)}>
                    <FaAngleRight />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </CardFooter>
      </Card>
    </Col>
  );
};

export default CourseStudentList;
