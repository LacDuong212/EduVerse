import { useEffect, useState } from "react";
import {
  Button,
  Card, CardBody, CardFooter, CardHeader,
  Col,
  OverlayTrigger,
  ProgressBar,
  Row,
  Tooltip
} from "react-bootstrap";
import { FaAngleLeft, FaAngleRight, FaRegEnvelope, FaRegStar, FaSearch, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import ChoicesFormInput from "@/components/form/ChoicesFormInput";
import { useCourseStudentList } from "../useCourseDetails";

const CourseStudentRow = ({ idx, student = {} }) => {
  const {
    stuId,
    name,
    email,
    avatar,
    enrolledAt,
    progress = null,
    review = null,
  } = student;

  const studentLink = stuId ? `/instructor/students/${stuId}` : "#";
  const progressPercentage = progress?.percentage || 0;

  return (
    <tr>
      <td>
        <div className="d-flex align-items-center position-relative">
          <div className="avatar avatar-md flex-shrink-0">
            {avatar ? (
              <img src={avatar} className="rounded-circle" alt={"avatar"} />
            ) : (
              <div className="avatar-img rounded-circle border border-light border-1 d-flex align-items-center justify-content-center fw-bold fs-4">
                {(name?.[0] || "S").toUpperCase()}
              </div>
            )}
          </div>
          <div className="mb-0 ms-2">
            <Link to={studentLink} className="stretched-link">{name}</Link>
            <div className="overflow-hidden mt-1">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="small fw-bold">{progressPercentage}%</span>
              </div>
              <div style={{ width: "160px" }}>
                <ProgressBar
                  now={progressPercentage}
                  className="progress progress-sm bg-opacity-10 w-100"
                  aria-valuenow={progressPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          </div>
        </div>
      </td>
      <td className="text-center">
        {enrolledAt ? new Date(enrolledAt).toLocaleDateString("en-GB") : "N/A"}
      </td>
      <td style={{ maxWidth: "320px" }}>
        {review ? (
          <>
            <div className="d-flex flex-wrap align-items-center mb-1">
              <ul className="list-inline mb-0 me-2 d-flex">
                {[...Array(5)].map((_, i) => (
                  <li key={i} className="list-inline-item me-0 small">
                    {i < Math.floor(review.rating) ? (
                      <FaStar className="text-warning" />
                    ) : i < review.rating ? (
                      <FaStarHalfAlt className="text-warning" />
                    ) : (
                      <FaRegStar className="text-warning" />
                    )}
                  </li>
                ))}
              </ul><span className="small">
                {review.updatedAt ? new Date(review.updatedAt).toLocaleDateString("en-GB") : ""}
              </span>
            </div>
            <p title={review.description || ""} className="mb-0">
              {review.description && review.description.length > 100
                ? `${review.description.substring(0, 100)}...`
                : review?.description}
            </p>
          </>
        ) : (
          <div className="text-center small">(No review yet)</div>
        )}
      </td>
      <td className="text-center">
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id={`tooltip-message-${student?.stuId || idx}`}>Copy Email</Tooltip>}
        >
          <Button
            variant="success-soft"
            className="btn-round mb-0"
            onClick={() => {
              navigator.clipboard.writeText(email);
              toast.success("Email copied!");
            }}
          >
            <FaRegEnvelope />
          </Button>
        </OverlayTrigger>
      </td>
    </tr>
  );
};

const CourseStudents = ({ col = 12 }) => {
  const {
    students,
    loading,
    page, setPage,
    limit,
    totalItems,
    totalPages,
    search, setSearch,
    sort, setSort,
  } = useCourseStudentList();

  const [searchTerm, setSearchTerm] = useState(search);

  useEffect(() => {
    setSearchTerm(search);
  }, [search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchTerm);
  };

  const start = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, totalItems);

  return (
    <Col xs={col}>
      <Card className="bg-transparent border">
        <CardHeader className="bg-light border-bottom">
          <Row className="align-items-center justify-content-between g-2">
            <Col xs={6} sm={7} md={8}>
              <form className="rounded position-relative" onSubmit={handleSearchSubmit}>
                <input
                  className="form-control pe-5"
                  type="search"
                  placeholder="Search students"
                  aria-label="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  className="bg-transparent p-2 me-1 position-absolute top-50 end-0 translate-middle-y border-0 text-primary-hover text-reset"
                  type="submit"
                >
                  <FaSearch className="fs-6" />
                </button>
              </form>
            </Col>
            <Col xs={6} sm={5} md={4}>
              <form className="flex-grow-1">
                <ChoicesFormInput
                  name="sort"
                  className="form-select js-choice border-0 z-index-9 bg-transparent"
                  aria-label=".form-select-sm"
                  value={sort}
                  onChange={(e) => setSort(e?.target?.value || "")}
                >
                  <option value="nameAsc">Name A-Z</option>
                  <option value="nameDesc">Name Z-A</option>
                  <option value="enrolledDesc">Newest Enroll</option>
                  <option value="enrolledAsc">Oldest Enroll</option>
                  <option value="progressDesc">Most Progress</option>
                  <option value="progressAsc">Least Progress</option>
                  <option value="ratingDesc">Highest Rating</option>
                  <option value="ratingAsc">Lowest Rating</option>
                </ChoicesFormInput>
              </form>
            </Col>
          </Row>
        </CardHeader>

        <CardBody className="p-0">
          <div className="table-responsive border-0">
            <table className="table table-dark-gray align-middle mb-0 table-hover">
              <thead>
                <tr>
                  <th scope="col" className="border-0">Student Name</th>
                  <th scope="col" className="border-0 text-center">Enrolled At</th>
                  <th scope="col" className="border-0 text-center">Review</th>
                  <th scope="col" className="border-0 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p text-center py-5">No students found.</td>
                  </tr>
                ) : (
                  students.map((student, idx) => (
                    <CourseStudentRow key={idx} idx={idx} student={student} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>

        <CardFooter className="bg-light p-2">
          <div className="d-sm-flex justify-content-sm-between align-items-sm-center">
            <p className="mb-0 text-center text-sm-start ps-2">
              Showing {start} to {end} of {totalItems} students
            </p>
            <nav aria-label="navigation" className="d-flex justify-content-center mb-0">
              <ul className="pagination pagination-sm pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
                <li className={`page-item mb-0 ${page === 1 ? "disabled" : ""}`}>
                  <Button className="page-link mb-0" onClick={() => setPage(page - 1)}>
                    <FaAngleLeft />
                  </Button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item mb-0 ${page === i + 1 ? "active" : ""}`}>
                    <Button className="page-link mb-0" onClick={() => setPage(i + 1)}>
                      {i + 1}
                    </Button>
                  </li>
                ))}
                <li className={`page-item mb-0 ${page >= totalPages ? "disabled" : ""}`}>
                  <Button className="page-link mb-0" onClick={() => setPage(page + 1)}>
                    <FaAngleRight />
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        </CardFooter>
      </Card>
    </Col>
  );
};

export default CourseStudents;