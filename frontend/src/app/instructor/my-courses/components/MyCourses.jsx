import ChoicesFormInput from '@/components/form/ChoicesFormInput';
import { useState } from "react";
import { Button, Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap';
import { FaAngleLeft, FaAngleRight, FaCheckCircle, FaRegEdit, FaSearch, FaTable, FaTimes } from 'react-icons/fa';

const MyCourses = ({ courses, page, limit, totalPages, totalCourses, loading, onPageChange }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onPageChange(1);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    onPageChange(1);
  };

  const goToPage = (pageNum) => {
    if (pageNum > 0 && pageNum <= totalPages) {
      onPageChange(pageNum);
    }
  };

  return (
    <Card className="border bg-transparent rounded-3">
      <CardHeader className="bg-transparent border-bottom">
        <Row className="align-items-center justify-content-between">
          <Col md={8}>
            <form className="rounded position-relative" onSubmit={handleSearchSubmit}>
              <input
                className="form-control pe-5 bg-transparent"
                type="search"
                placeholder="Search courses"
                aria-label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="bg-transparent p-2 position-absolute top-50 end-0 translate-middle-y border-0 text-primary-hover text-reset"
                type="submit"
              >
                <FaSearch className="fas fa-search fs-6 " />
              </button>
            </form>
          </Col>
          <Col md={4}>
            <form>
              <ChoicesFormInput
                className="form-select js-choice border-0 z-index-9 bg-transparent"
                aria-label=".form-select-sm"
                value={sort}
                onChange={handleSortChange}
              >
                <option value="">Sort by</option>
                <option value="free">Free</option>
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rating</option>
              </ChoicesFormInput>
            </form>
          </Col>
        </Row>
      </CardHeader>
      <CardBody>
        {loading ? (
          <p>Loading courses...</p>
        ) : courses.length === 0 ? (
          <p className="text-center">No courses found.</p>
        ) : (
          <>
            <div className="table-responsive border-0">
              <table className="table table-dark-gray align-middle p-4 mb-0 table-hover">
                <thead>
                  <tr>
                    <th scope="col" className="border-0 rounded-start">
                      Course Title
                    </th>
                    <th scope="col" className="border-0">
                      Enrolled
                    </th>
                    <th scope="col" className="border-0">
                      Status
                    </th>
                    <th scope="col" className="border-0">
                      Price
                    </th>
                    <th scope="col" className="border-0 rounded-end">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            style={{
                              width: "60px",
                              height: "60px",
                              overflow: "hidden",
                              borderRadius: "0.375rem",
                            }}
                          >
                            <img
                              src={course.thumbnail || ""}
                              alt={course.title || "Course image"}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                              }}
                            />
                          </div>
                          <div className="mb-0 ms-2">
                            <h6>
                              <a href={`/course/${course._id}`}>
                                {course.title}
                              </a>
                            </h6>
                            <div className="d-sm-flex">
                              <p className="h6 fw-light mb-0 small me-3">
                                <FaTable className="text-orange me-2" />
                                {course.lecturesCount || 0} lectures
                              </p>
                              <p className="h6 fw-light mb-0 small">
                                <FaCheckCircle className="text-success me-2" />
                                {course.completedLectures || 0} Completed
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center text-sm-start">
                        {course.enrolledCount || 0}
                      </td>
                      <td>
                        <div
                          className={`badge ${course.status === "Live"
                              ? "bg-success bg-opacity-10 text-success"
                              : "bg-secondary bg-opacity-10 text-secondary"
                            }`}
                        >
                          {course.status || "Draft"}
                        </div>
                      </td>
                      <td>
                        {course.price === 0
                          ? "Free"
                          : `$${course.price?.toFixed(2) || "0.00"}`}
                      </td>
                      <td>
                        <Button
                          variant="success-soft"
                          size="sm"
                          className="btn-round me-1 mb-0"
                        >
                          <FaRegEdit className="fa-fw" />
                        </Button>
                        <button className="btn btn-sm btn-danger-soft btn-round mb-0">
                          <FaTimes className="fa-fw" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-sm-flex justify-content-sm-between align-items-sm-center mt-4 mt-sm-3">
              <p className="mb-0 text-center text-sm-start">
                Showing {(page - 1) * limit + 1} to{" "}
                {Math.min(page * limit, totalCourses)} of {totalCourses} entries
              </p>
              <nav
                className="d-flex justify-content-center mb-0"
                aria-label="navigation"
              >
                <ul className="pagination pagination-sm pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
                  <li
                    className={`page-item ${page === 1 ? "disabled" : ""}`}
                    onClick={() => goToPage(page - 1)}
                  >
                    <a className="page-link" href="#!" tabIndex={-1}>
                      <FaAngleLeft />
                    </a>
                  </li>
                  {[...Array(totalPages)].map((_, idx) => (
                    <li
                      key={idx + 1}
                      className={`page-item ${page === idx + 1 ? "active" : ""}`}
                      onClick={() => goToPage(idx + 1)}
                    >
                      <a className="page-link" href="#!">
                        {idx + 1}
                      </a>
                    </li>
                  ))}
                  <li
                    className={`page-item ${page === totalPages ? "disabled" : ""}`}
                    onClick={() => goToPage(page + 1)}
                  >
                    <a className="page-link" href="#!">
                      <FaAngleRight />
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default MyCourses;
