import ChoicesFormInput from '@/components/form/ChoicesFormInput';
import { formatCurrency } from '@/utils/currency';
import { Button, Card, CardBody, CardHeader, Col, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { BsPersonFill } from 'react-icons/bs';
import { FaAngleLeft, FaAngleRight, FaFile, FaFolder, FaGlobe, FaLock, FaRegEdit, FaSearch, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';


const MyCourses = ({ 
  courses,
  totalCourses,
  page,
  limit,
  totalPages,
  loading,
  onPageChange,
  onTogglePrivacy,
  searchTerm,
  setSearchTerm,
  sort,
  setSort 
}) => {
  const statusBadge = (status) => {
    return status === "Live"
      ? "success"
      : status === "Pending"
      ? "warning"
      : status === "Rejected"
      ? "orange"
      : status === "Blocked"
      ? "danger"
      : "secondary";
  }
    
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onPageChange(1);
  };

  const handleSortChange = (value) => {
    setSort(value);   // cus ChoicesFormInput accepts value directly, not an event (e.target.value)
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
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="mostPopular">Most Popular</option>
                <option value="leastPopular">Least Popular</option>
                <option value="highestRating">Highest Rating</option>
                <option value="lowestRating">Lowest Rating</option>
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
                      Course
                    </th>
                    <th scope="col" className="border-0">
                      Updated At
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
                          <div className="flex-shrink-0 rounded overflow-hidden" style={{ width: "80px", height: "80px" }}>
                            <img
                              src={course.image || course.thumbnail || "https://res.cloudinary.com/dw1fjzfom/image/upload/v1757337425/av4_khpvlh.png"}
                              alt={course.title || 'Course Image'}
                              className="img-fluid h-100 w-100 object-fit-cover"
                            />
                          </div>
                          <div className="ms-2 flex-grow-1">
                            <div className="mb-1">
                              <h6 className="mb-0">
                                <a
                                  href={`courses/${course._id}`}
                                  className="text-decoration-none d-inline-block"
                                >
                                  {course.title}
                                </a>
                              </h6>

                              <div className="small">
                                {course.subtitle}
                              </div>
                            </div>
                            <div className="small">
                              <div className="row gx-2">
                                <div className="col-md-6 col-lg-4 col-xl-5 d-flex align-items-center">
                                  <FaStar className="text-warning mb-1 me-1" />
                                  {course.rating?.average || 0} Rating
                                </div>

                                <div className="col-md-6 col-lg-4 col-xl-5 d-flex align-items-center">
                                  <BsPersonFill className="text-info mb-1 me-1" />
                                  {course.enrolledCount || 0} Enrolled
                                </div>
                              </div>
                              <div className="row gx-2">
                                <div className="col-md-6 col-lg-4 col-xl-5 d-flex align-items-center">
                                  <FaFolder className="me-1" />
                                  {course.curriculum?.length || 0} Sections
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
                      <td className="text-center text-sm-start">
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
                      <td>
                        <div
                          className={`badge bg-${statusBadge(course?.status)} bg-opacity-10 text-${statusBadge(course?.status)} fs-6`}
                        >
                          {course.status || "N/A"}
                        </div>
                      </td>
                      <td>
                        {course.price === 0 ? "Free" : course.enableDiscount ? (
                          <>
                            {formatCurrency(course.discountPrice)}{" "}
                            <span className="text-decoration-line-through small">
                              {formatCurrency(course.price)}
                            </span>
                          </>
                        ) : (
                          formatCurrency(course.price)
                        )}
                      </td>
                      <td>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id={`tooltip-edit-${course._id}`}>Edit Course</Tooltip>}
                        >
                          <Button
                            variant="primary-soft"
                            size="sm"
                            className="btn-round me-1"
                            as={Link}
                            to={`/instructor/courses/edit/${course._id}`}
                          >
                            <FaRegEdit className="fa-fw" />
                          </Button>
                        </OverlayTrigger>
                        {course.isPrivate ? (
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`tooltip-public-${course._id}`}>Make course public</Tooltip>}
                          >
                            <button 
                              className="btn btn-sm btn-success-soft btn-round"
                              onClick={() => onTogglePrivacy(course._id, course.isPrivate)}
                            >
                              <FaGlobe className="fa-fw" />
                            </button>
                          </OverlayTrigger>
                        ) : (
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`tooltip-private-${course._id}`}>Make course private</Tooltip>}
                          >
                            <button 
                              className="btn btn-sm btn-danger-soft btn-round"
                              onClick={() => onTogglePrivacy(course._id, course.isPrivate)}
                            >
                              <FaLock className="fa-fw" />
                            </button>
                          </OverlayTrigger>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-sm-flex justify-content-sm-between align-items-sm-center mt-4 mt-sm-3">
              <p className="mb-0 text-center text-sm-start">
                Showing {totalCourses === 0 ? 0 : (page - 1) * limit + 1} to{" "}
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
