import ChoicesFormInput from "@/components/form/ChoicesFormInput";
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Row } from "react-bootstrap";
import { FaAngleLeft, FaAngleRight, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";


const CourseCard = ({
  _id,
  image,
  title,
  instructor,
  createdAt,
  level,
  price,
  status,
  thumbnail,
}) => {
  const levelBadge =
    level === "Beginner"
      ? "warning"
      : level === "All"
      ? "success"
      : level === "Intermediate"
      ? "orange"
      : level === "Advanced"
      ? "purple"
      : "info";

  const statusBadge =
    status === "Pending"
      ? "warning"
      : status === "Rejected"
      ? "danger"
      : "success";

  return (
    <tr>
      <td>
        <div className="d-flex align-items-center position-relative">
          <div className="w-60px">
            <img src={image || thumbnail} className="rounded" alt={title} />
          </div>
          <h6 className="table-responsive-title mb-0 ms-2">
            <Link to={`/course/${_id}`} className="stretched-link">
              {title}
            </Link>
          </h6>
        </div>
      </td>

      <td>
        <div className="d-flex align-items-center mb-3">
          <div className="avatar avatar-xs flex-shrink-0">
            <img
              className="avatar-img rounded-circle"
              src={instructor?.avatar || "/images/avatar-placeholder.png"}
              alt={instructor?.name || "Instructor"}
            />
          </div>
          <div className="ms-2">
            <h6 className="mb-0 fw-light">{instructor?.name || "Unknown"}</h6>
          </div>
        </div>
      </td>

      <td>{new Date(createdAt).toLocaleDateString()}</td>

      <td>
        <span className={`badge text-bg-${levelBadge}`}>{level || "All"}</span>
      </td>

      <td>${price}</td>

      <td>
        <span
          className={`badge text-${statusBadge} bg-${statusBadge} bg-opacity-15`}
        >
          {status}
        </span>
      </td>

      <td>
        {status === "Pending" ? (
          <>
            <Button
              variant="success-soft"
              size="sm"
              className="me-1 mb-1 mb-md-0"
            >
              Approve
            </Button>
            <button className="btn btn-sm btn-secondary-soft mb-0">
              Reject
            </button>
          </>
        ) : (
          <Button variant="dark" size="sm" className="me-1 mb-1 mb-md-0">
            Edit
          </Button>
        )}
      </td>
    </tr>
  );
};

const CoursesList = ({ courses, meta, loading, fetchCourses }) => {

  return (
    <Card className="bg-transparent border">
      <CardHeader className="bg-light border-bottom">
        <Row className="g-3 align-items-center justify-content-between">
          <Col md={8}>
            <form className="rounded position-relative">
              <input
                className="form-control bg-body"
                type="search"
                placeholder="Search"
                aria-label="Search"
              />
              <button
                className="bg-transparent p-2 position-absolute top-50 end-0 translate-middle-y border-0 text-primary-hover text-reset"
                type="submit"
              >
                <FaSearch />
              </button>
            </form>
          </Col>

          <Col md={3}>
            <form>
              <ChoicesFormInput
                className="form-select js-choice border-0 z-index-9"
                aria-label=".form-select-sm"
              >
                <option>Sort by</option>
                <option>Newest</option>
                <option>Oldest</option>
                <option>Live</option>
                <option>Pending</option>
              </ChoicesFormInput>
            </form>
          </Col>
        </Row>
      </CardHeader>

      <CardBody>
        {loading ? (
          <p>Loading courses...</p>
        ) : (
          <div className="table-responsive border-0 rounded-3">
            <table className="table table-dark-gray align-middle p-4 mb-0 table-hover">
              <thead>
                <tr>
                  <th className="border-0 rounded-start">Course Name</th>
                  <th className="border-0">Instructor</th>
                  <th className="border-0">Added Date</th>
                  <th className="border-0">Level</th>
                  <th className="border-0">Price</th>
                  <th className="border-0">Status</th>
                  <th className="border-0 rounded-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {courses.length > 0 ? (
                  courses.map((item) => (
                    <CourseCard key={item._id} {...item} />
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No courses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>

      <CardFooter className="bg-transparent pt-0">
        <div className="d-sm-flex justify-content-sm-between align-items-sm-center">
          <p className="mb-0 text-center text-sm-start">
            Showing {meta?.currentPage} of {meta?.totalPages} pages (
            {meta?.totalCourses} courses)
          </p>

          <nav className="d-flex justify-content-center mb-0" aria-label="navigation">
            <ul className="pagination pagination-sm pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
              <li className={`page-item mb-0 ${meta.currentPage === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => fetchCourses(meta.currentPage - 1)}
                  disabled={meta.currentPage === 1}
                >
                  <FaAngleLeft />
                </button>
              </li>

              <li className="page-item mb-0 active">
                <span className="page-link">{meta.currentPage}</span>
              </li>

              <li
                className={`page-item mb-0 ${
                  meta.currentPage >= meta.totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => fetchCourses(meta.currentPage + 1)}
                  disabled={meta.currentPage >= meta.totalPages}
                >
                  <FaAngleRight />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CoursesList;
