import { useEffect, useState } from "react";
import {
  Button,
  Card, CardBody, CardFooter, CardHeader,
  Col,
  OverlayTrigger,
  Row,
  Tooltip
} from "react-bootstrap";
import { FaAngleLeft, FaAngleRight, FaRegEnvelope, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import ChoicesFormInput from "@/components/form/ChoicesFormInput";
import { DEFAULT_AVATAR_IMG } from "@/contexts/constants";

const StudentRow = ({ idx, studentData = {} }) => {
  const { stuId, name, avatar, coursesCount, isActive, email } = studentData;
  return (
    <tr>
      <td className="ps-3">
        <div className="d-flex align-items-center position-relative">
          <div className="avatar avatar-md flex-shrink-0">
            {avatar ? (
              <img
                src={avatar || DEFAULT_AVATAR_IMG}
                className="rounded-circle"
                alt="avatar"
                onError={(e) => e.target.src = DEFAULT_AVATAR_IMG}
              />
            ) : (
              <div className="avatar-img rounded-circle border-light border-2 shadow d-flex align-items-center justify-content-center bg-light text-dark fw-bold fs-4">
                {(name?.[0] || "S").toUpperCase()}
              </div>
            )}
          </div>
          <div className="mb-0 ms-2">
            <h6 className="mb-0">
              {/* #TODO?: student details page */}
              <Link to={null}>{name}</Link>
            </h6>
          </div>
        </div>
      </td>
      <td className="text-center d-none d-md-table-cell">
        {coursesCount || "-"}
      </td>
      <td className="text-center">
        {isActive ? (
          <div className="badge bg-success bg-opacity-10 text-success">Active</div>
        ) : (
          <div className="badge bg-danger bg-opacity-10 text-danger">Inactive</div>
        )}
      </td>
      <td className="text-center">
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id={`tooltip-message-${stuId || idx}`}>Copy Email</Tooltip>}
        >
          <button
            type="button"
            className="btn btn-success-soft btn-round me-2 mb-0 flex-centered"
            onClick={() => {
              if (email) {
                navigator.clipboard.writeText(email);
                toast.success("Email copied!");
              }
            }}
          >
            <FaRegEnvelope />
          </button>
        </OverlayTrigger>
      </td>
    </tr>
  );
};

const MyStudentsList = ({
  col = 12,
  students = [],
  totalStudents = 0,
  totalPages = 0,
  loading = false,
  currentSearch = "",
  currentSort = "enrolledDesc",
  onPageChange,
  onSearch,
  onSortChange,
}) => {
  const NUMBER_OF_COLUMNS = 4;

  const [searchTerm, setSearchTerm] = useState(currentSearch);

  useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const page = parseInt(new URLSearchParams(window.location.search).get("page") || "1");
  const limit = 10;
  const start = totalStudents === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, totalStudents);

  const goToPage = (pageNum) => {
    if (pageNum > 0 && pageNum <= totalPages) {
      onPageChange(pageNum);
    }
  };

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
              <form>
                <ChoicesFormInput
                  name="currentSort"
                  className="form-select js-choice border-0 z-index-9 bg-transparent"
                  aria-label=".form-select-sm"
                  value={currentSort}
                  onChange={(e) => onSortChange(e?.target?.value || "")}
                >
                  <option value="nameAsc">Name A-Z</option>
                  <option value="nameDesc">Name Z-A</option>
                  <option value="enrolledDesc">Newest Enroll</option>
                  <option value="enrolledAsc">Oldest Enroll</option>
                </ChoicesFormInput>
              </form>
            </Col>
          </Row>
        </CardHeader>

        <CardBody className="p-0">
          <div className="table-responsive border-0">
            <table className="table table-dark-gray align-middle table-hover mb-0">
              <thead>
                <tr>
                  <th scope="col" className="border-0 ps-3">Student Name</th>
                  <th scope="col" className="border-0 text-center d-none d-md-table-cell">Courses Enrolled</th>
                  <th scope="col" className="border-0 text-center">Status</th>
                  <th scope="col" className="border-0 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={NUMBER_OF_COLUMNS} className="text-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={NUMBER_OF_COLUMNS} className="text-center py-5">
                      <p className="mb-0">No students found.</p>
                    </td>
                  </tr>
                ) : (
                  students.map((student, idx) => (
                    <StudentRow key={idx} idx={idx} studentData={student} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>

        <CardFooter className="bg-light p-2">
          <div className="d-sm-flex justify-content-sm-between align-items-sm-center">
            <p className="mb-0 text-center text-sm-start ps-2">
              Showing {start} to {end} of {totalStudents} students
            </p>
            <nav
              className="d-flex justify-content-center mb-0"
              aria-label="navigation"
            >
              <ul className="pagination pagination-sm pagination-primary-soft d-inline-block d-md-flex rounded mb-0">
                <li
                  className={`page-item ${page <= 1 ? "disabled" : ""}`}
                  onClick={() => goToPage(page - 1)}
                >
                  <Button className="page-link mb-0" tabIndex={-1}>
                    <FaAngleLeft />
                  </Button>
                </li>
                {[...Array(totalPages)].map((_, idx) => (
                  <li
                    key={idx + 1}
                    className={`page-item ${page === idx + 1 ? "active" : ""}`}
                    onClick={() => goToPage(idx + 1)}
                  >
                    <Button className="page-link mb-0">
                      {idx + 1}
                    </Button>
                  </li>
                ))}
                <li
                  className={`page-item ${page >= totalPages ? "disabled" : ""}`}
                  onClick={() => goToPage(page + 1)}
                >
                  <Button className="page-link mb-0">
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

export default MyStudentsList;