import ChoicesFormInput from '@/components/form/ChoicesFormInput';
import { useState } from 'react';
import { Card, CardBody, CardFooter, CardHeader, Col, OverlayTrigger, ProgressBar, Row, Tooltip } from 'react-bootstrap';
import { FaAngleLeft, FaAngleRight, FaRegEnvelope, FaRegStar, FaSearch, FaStar, FaStarHalfAlt } from 'react-icons/fa';


const StudentRow = ({ studentData }) => {
  const student = studentData?.student || {};
  const recentReview = studentData?.recentReview || null;

  return (
    <tr>
      <td className="ps-3">
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
        {recentReview ? (
          <>
            <div className="d-flex flex-wrap align-items-center mb-1">
              <ul className="list-inline mb-0 me-2 d-flex align-items-center">
                {(recentReview?.rating || recentReview?.rating === 0) && (
                  <>
                    {Array(Math.floor(recentReview.rating)).fill(0).map((_star, idx) => (
                      <li key={idx} className="list-inline-item me-1 small">
                        <FaStar size={14} className="text-warning mb-1" />
                      </li>
                    ))}
                    {!Number.isInteger(recentReview.rating) && (
                      <li className="list-inline-item me-1 small">
                        <FaStarHalfAlt size={14} className="text-warning mb-1" />
                      </li>
                    )}
                    {recentReview.rating < 5 &&
                      Array(5 - Math.ceil(recentReview.rating)).fill(0).map((_star, idx) => (
                        <li key={idx} className="list-inline-item me-1 small">
                          <FaRegStar size={14} className="text-warning mb-1" />
                        </li>
                      ))}
                  </>
                )}
              </ul>
              <div className="small mt-0">
                <span className="fw-bold"> • </span>
                {recentReview.updatedAt
                  ? new Date(recentReview.updatedAt).toLocaleString("en-GB", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                  : "N/A"}
              </div>
            </div>
            <div title={recentReview?.description || ''}>
              {recentReview?.description && recentReview.description.length > 100
                ? `${recentReview.description.substring(0, 100)}...`
                : recentReview?.description}
            </div>
          </>
        ) : (
          "-"
        )}
      </td>
      <td className="text-center">
        {student?.isActive === null ? (
          <div className="badge bg-secondary bg-opacity-10 text-secondary">
            -
          </div>
        ) : student?.isActive ? (
          <div className="badge bg-success bg-opacity-10 text-success">
            Active
          </div>
        ) : (
          <div className="badge bg-warning bg-opacity-10 text-warning">
            Inactive
          </div>
        )}
      </td>
      <td className="text-center">
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id={`tooltip-message-${student?._id}`}>Message</Tooltip>}
        >
          <a title="Message" href="#" className="btn btn-success-soft btn-round me-2 mb-0 flex-centered" data-bs-toggle="tooltip" data-bs-placement="top">
            <FaRegEnvelope className="far fa-envelope" />
          </a>
        </OverlayTrigger>
      </td>
    </tr>
  );
};

const MyStudentsList = ({
  col = 12,
  students = [],
  totalStudents = 0,
  page = 1,
  limit = 5,
  totalPages = 0,
  loading = false,
  onPageChange,
  searchTerm = '',
  setSearchTerm,
  sort,
  setSort,
}) => {
  const NUMBER_OF_COLUMNS = 5;
  const start = (page - 1) * limit + 1;
  const end = Math.min(start + students.length - 1, totalStudents);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onPageChange(1);
  };

  const handleSortChange = (value) => {
    setSort(value);
    onPageChange(1);
  };

  const goToPage = (pageNum) => {
    if (pageNum > 0 && pageNum <= totalPages) {
      onPageChange(pageNum);
    }
  };

  return (
    <Col xs={col}>
      <Card className="bg-transparent border">
        <CardHeader className="bg-transparent border-bottom">
          <Row className="align-items-center justify-content-between g-2">
            <Col md={8}>
              <form className="rounded position-relative" onSubmit={handleSearchSubmit}>
                <input
                  className="form-control pe-5 bg-transparent"
                  type="search"
                  placeholder="Search students"
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
                  <option value="nameAsc">Name Ascending</option>
                  <option value="nameDesc">Name Descending</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="mostProgess">Most Progress</option>
                  <option value="leastProgress">Least Progress</option>
                </ChoicesFormInput>
              </form>
            </Col>
          </Row>
        </CardHeader>

        <CardBody className="p-0">
          <div className="table-responsive border-0">
            <table className="table table-dark-gray align-middle table-hove mb-0">
              <thead>
                <tr>
                  <th scope="col" className="border-0 ps-3">
                    Student Name
                  </th>
                  <th scope="col" className="border-0 text-center d-none d-md-table-cell">
                    Enrolled At
                  </th>
                  <th scope="col" className="border-0 text-center d-none d-md-table-cell">
                    Recent Review
                  </th>
                  <th scope="col" className="border-0 text-center">
                    Status
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
                      <p className="my-5">Loading students...</p>
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={NUMBER_OF_COLUMNS} className="text-center">
                      <p className="my-5">No students found.</p>
                    </td>
                  </tr>
                ) : (
                  students.map((student, idx) => (
                    <StudentRow key={idx} studentData={student} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>

        <CardFooter className="bg-transparent p-2">
          <div className="d-sm-flex justify-content-sm-between align-items-sm-center">
            <p className="mb-0 text-center text-sm-start ps-2">
              Showing {totalStudents === 0 ? 0 : start} to {end} of {totalStudents} students
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
    </Col>
  );
};

export default MyStudentsList;
