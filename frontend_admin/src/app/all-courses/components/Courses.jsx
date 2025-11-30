import ChoicesFormInput from "@/components/form/ChoicesFormInput";
import { updateCourseStatus } from "@/helpers/data";
import { Button, Card, CardBody, CardFooter, CardHeader, Col, Row } from "react-bootstrap";
import { FaAngleLeft, FaAngleRight, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";


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
  refreshCourses,
}) => {
  const levelBadge =
    level === "Beginner" ? "warning"
      : level === "All" ? "success"
        : level === "Intermediate" ? "orange"
          : level === "Advanced" ? "purple" : "info";

  const statusBadge =
    status === "Pending" ? "warning"
      : status === "Rejected" ? "danger" : "success";

  const handleStatusUpdate = async (newStatus) => {
    const res = await updateCourseStatus({ id: _id, status: newStatus });
    if (res.success) {
      toast.success(`Course ${newStatus} successfully`);
      refreshCourses?.();
    } else {
      toast.error("Update status failed");
    }
  };

  return (
    <tr>
      <td>
        <div className="d-flex align-items-center position-relative">
          <div className="w-60px">
            <img src={image || thumbnail} className="rounded" alt={title} />
          </div>
          <h6 className="table-responsive-title mb-0 ms-2">
            <Link to={`/courses/${_id}`} className="stretched-link">
              {title}
            </Link>
          </h6>
        </div>
      </td>

      <td>
        <div className="d-flex align-items-center mb-3">
          <div className="avatar avatar-xs flex-shrink-0">
            {instructor?.avatar ? (
              <img
                src={instructor.avatar}
                className="rounded-circle"
                alt={instructor?.name || "I"}
              />
            ) : (
              <div className="avatar-img rounded-circle border-white border-3 shadow d-flex align-items-center justify-content-center bg-light text-dark fw-bold fs-5">
                {(instructor?.name?.[0] || "I").toUpperCase()}
              </div>
            )}
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

      <td>{price}đ</td>

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
              onClick={() => handleStatusUpdate("Live")}
            >
              Approve
            </Button>
            <Button
              variant="secondary-soft"
              size="sm"
              className="me-1 mb-1 mb-md-0"
              onClick={() => handleStatusUpdate("Rejected")}
            >
              Reject
            </Button>
          </>
        ) : status === "Live" ? (
          <Button
            variant="warning-soft"
            size="sm"
            className="me-1 mb-1 mb-md-0"
            onClick={() => handleStatusUpdate("Blocked")}
          >
            Block
          </Button>
        ) : status === "Rejected" ? (
          <Button
            variant="success-soft"
            size="sm"
            className="me-1 mb-1 mb-md-0"
            onClick={() => handleStatusUpdate("Pending")}
          >
            Approve
          </Button>
        ) : status === "Blocked" ? (
          <Button
            variant="info-soft"
            size="sm"
            className="me-1 mb-1 mb-md-0"
            onClick={() => handleStatusUpdate("Pending")}
          >
            Unblock
          </Button>
        ) : (
          <Button variant="danger-soft" size="sm" className="me-1 mb-1 mb-md-0">
            Remove
          </Button>
        )}
      </td>
    </tr>
  );
};

const CoursesList = ({
  courses,
  meta,
  loading,
  search,
  setSearch,
  setPage,
  refreshCourses
}) => {
  const start = (meta?.currentPage - 1) * 8 + 1;
  const end = Math.min(meta?.currentPage * 8, meta?.totalCourses);

  const getPageNumbers = () => {
    const pages = [];
    const totalPages = meta?.totalPages || 1;
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <Card className="bg-transparent border">
      <CardHeader className="bg-light border-bottom">
        <Row className="g-3 align-items-center justify-content-between">
          <Col md={8}>
            <form className="rounded position-relative" onSubmit={(e) => e.preventDefault()}>
              <input
                className="form-control bg-body"
                type="text"
                placeholder="Search course..."
                aria-label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="bg-transparent p-2 position-absolute top-50 end-0 translate-middle-y border-0 text-primary-hover text-reset"
                type="submit"
              >
                <FaSearch />
              </button>
            </form>
          </Col>
        </Row>
      </CardHeader>

      <CardBody>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
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
                    <CourseCard
                      key={item._id}
                      {...item}
                      refreshCourses={refreshCourses}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No courses found matching "{search}".
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
            Showing {meta?.totalCourses === 0 ? 0 : start} to {end} of {meta?.totalCourses} courses
          </p>

          <nav className="d-flex justify-content-center mb-0" aria-label="navigation">
            <ul className="pagination pagination-sm pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
              <li className={`page-item mb-0 ${meta.currentPage === 1 ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setPage(meta.currentPage - 1)}
                  disabled={meta.currentPage === 1}
                >
                  <FaAngleLeft />
                </button>
              </li>

              {getPageNumbers().map((pageNum) => (
                <li
                  key={pageNum}
                  className={`page-item mb-0 ${pageNum === meta.currentPage ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                </li>
              ))}

              <li className={`page-item mb-0 ${meta.currentPage >= meta.totalPages ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setPage(meta.currentPage + 1)}
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
