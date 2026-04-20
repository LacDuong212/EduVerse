import ChoicesFormInput from "@/components/form/ChoicesFormInput";
import { DEFAULT_COURSE_IMG } from "@/contexts/constants";
import { formatCurrency } from "@/utils/currency";
import { useState } from "react";
import { Button, Card, CardBody, CardFooter, CardHeader, Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { BsPersonFill } from "react-icons/bs";
import { FaAngleLeft, FaAngleRight, FaFile, FaFolder, FaGlobe, FaLock, FaPlus, FaRegEdit, FaSearch, FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";

// #TODO: url params for pagination, search, sort
const MyCourses = ({
  courses,
  totalCourses,
  page,
  limit,
  totalPages,
  loading,

  onPageChange,
  onTogglePrivacy,

  onSearch,
  onSortChange,
}) => {
  const NUMBER_OF_COLUMNS = 5;

  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState("");

  const statusBadge = (status) => {
    return status === "live"
      ? "success"
      : status === "pending"
        ? "warning"
        : status === "draft"
          ? "info"
          : status === "rejected"
            ? "orange"
            : status === "blocked"
              ? "danger"
              : "secondary";
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleSortChange = (value) => {
    setSort(value);
    onSortChange(value);
  };

  const goToPage = (pageNum) => {
    if (pageNum > 0 && pageNum <= totalPages) {
      onPageChange(pageNum);
    }
  };

  return (
    <Card className="border bg-transparent rounded-3">
      <CardHeader className="bg-transparent border-bottom">
        <Row className="align-items-center justify-content-between g-2 g-md-4">
          {/* SEARCH */}
          <Col md={6}>
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

          {/* ACTIONS (Sort + Create Button) */}
          <Col md={6}>
            <div className="d-flex align-items-center justify-content-end gap-2">
              {/* Sort Dropdown */}
              <form className="flex-grow-1">
                <ChoicesFormInput
                  className="form-select js-choice border-0 z-index-9 bg-transparent"
                  aria-label=".form-select-sm"
                  value={sort}
                  onChange={handleSortChange}
                >
                  <option value="">Sort by</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="mostPopular">Most Popular</option>
                  <option value="leastPopular">Least Popular</option>
                  <option value="highestRating">Highest Rating</option>
                  <option value="lowestRating">Lowest Rating</option>
                </ChoicesFormInput>
              </form>
              {/* Create Button */}
              <Button
                variant="primary"
                as={Link}
                to="/instructor/courses/create"
                className="btn-sm d-flex align-items-center justify-content-center mb-0"
              >
                <FaPlus className="me-0 my-1 me-sm-1" /> {/* Margin only on larger screens */}
                <span className="d-none d-sm-block">Create Course</span> {/* Text hidden on mobile */}
              </Button>
            </div>
          </Col>
        </Row>
      </CardHeader>

      <CardBody className="p-0">
        <div className="table-responsive border-0">
          <table className="table table-dark-gray align-middle mb-0 table-hover">
            <thead>
              <tr>
                <th scope="col" className="border-0 ps-3">
                  Course
                </th>
                <th scope="col" className="border-0 text-center d-none d-md-table-cell">
                  Updated At
                </th>
                <th scope="col" className="border-0 text-center">
                  Status
                </th>
                <th scope="col" className="border-0 text-center d-none d-md-table-cell">
                  Price
                </th>
                <th scope="col" className="border-0 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={NUMBER_OF_COLUMNS} className="text-center">
                    <p className="my-5">Loading courses...</p>
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={NUMBER_OF_COLUMNS} className="text-center">
                    <p className="my-5">No courses found.</p>
                  </td>
                </tr>
              ) : (courses.map((course) => (
                <tr key={course.courseId}>
                  <td className="ps-3">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0 rounded overflow-hidden" style={{ width: "80px", height: "80px" }}>
                        <img
                          src={course.image || DEFAULT_COURSE_IMG}
                          alt={course.title || "Course Image"}
                          className="img-fluid h-100 w-100 object-fit-cover"
                        />
                      </div>
                      <div className="ms-2 flex-grow-1 text-wrap">
                        <div className="mb-1">
                          <h6 className="mb-0">
                            <Link
                              to={`${course.courseId || ''}`}
                              className="text-decoration-none d-inline-block"
                            >
                              {course.title}
                            </Link>
                          </h6>
                          <div className="small text-wrap">
                            {course.subtitle}
                          </div>
                        </div>
                        <div className="small">
                          {course?.status !== "draft" && (
                            <div className="row gx-2">
                              <div className="col-md-6 col-lg-4 col-xl-5 d-flex align-items-center">
                                <FaStar className="text-warning mb-1 me-1" />
                                {course.averageRating || 0} Rating
                              </div>

                              <div className="col-md-6 col-lg-4 col-xl-5 d-flex align-items-center">
                                <BsPersonFill className="text-info mb-1 me-1" />
                                {course.studentsEnrolled || 0} Enrolled
                              </div>
                            </div>
                          )}
                          <div className="row gx-2">
                            <div className="col-md-6 col-lg-4 col-xl-5 d-flex align-items-center">
                              <FaFolder className="me-1" />
                              {course.sectionsCount || 0} Sections
                            </div>
                            <div className="col-md-6 col-lg-4 col-xl-5 d-flex align-items-center">
                              <FaFile className="me-1" />
                              {course.lecturesCount || 0} Lectures
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="text-center d-none d-md-table-cell">
                    {course.updatedAt
                      ? new Date(course.updatedAt).toLocaleString("en-GB", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                      : "N/A"}
                  </td>
                  <td className="text-center">
                    <div
                      className={`badge bg-${statusBadge(course?.status)} bg-opacity-10 text-${statusBadge(course?.status)}`}
                    >
                      {course.status?.toUpperCase() || "N/A"}
                    </div>
                  </td>
                  <td className="d-none d-md-table-cell">
                    {!Number.isFinite(course.price) ? (
                      <div className="text-center">
                        -
                      </div>
                    ) : course.enableDiscount ? (
                      <div className="text-end">
                        {formatCurrency(course.discountPrice)}
                        <div className="text-decoration-line-through small">
                          {formatCurrency(course.price)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-end">
                        {formatCurrency(course.price)}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="d-flex flex-column flex-lg-row align-items-center justify-content-center gap-2">
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id={`tooltip-edit-${course.courseId}`}>Edit Course</Tooltip>}
                      >
                        <Button
                          variant="primary-soft"
                          size="sm"
                          className="btn-round mb-0"
                          as={Link}
                          to={`/instructor/courses/${course.courseId || ''}/edit`}
                        >
                          <FaRegEdit className="fa-fw" />
                        </Button>
                      </OverlayTrigger>
                      {course.isPrivate ? (
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id={`tooltip-public-${course.courseId}`}>Make course public</Tooltip>}
                        >
                          <button
                            className="btn btn-sm btn-success-soft btn-round mb-0"
                            onClick={() => onTogglePrivacy(course.courseId || '', !course.isPrivate)}
                          >
                            <FaGlobe className="fa-fw" />
                          </button>
                        </OverlayTrigger>
                      ) : (
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id={`tooltip-private-${course.courseId}`}>Make course private</Tooltip>}
                        >
                          <button
                            className="btn btn-sm btn-danger-soft btn-round mb-0"
                            onClick={() => onTogglePrivacy(course.courseId || '', !course.isPrivate)}
                          >
                            <FaLock className="fa-fw" />
                          </button>
                        </OverlayTrigger>
                      )}
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </CardBody>

      <CardFooter className="bg-transparent p-2">
        <div className="d-sm-flex justify-content-sm-between align-items-sm-center">
          <p className="mb-0 text-center text-sm-start ps-2">
            Showing {totalCourses === 0 ? 0 : (page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, totalCourses)} of {totalCourses} courses
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
      </CardFooter>
    </Card>
  );
};

export default MyCourses;
