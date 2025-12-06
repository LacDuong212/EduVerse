import ChoicesFormInput from '@/components/form/ChoicesFormInput';
import { Card, CardBody, CardFooter, CardHeader, Col, OverlayTrigger, ProgressBar, Row, Tooltip } from 'react-bootstrap';
import { FaAngleLeft, FaAngleRight, FaRegEnvelope, FaSearch } from 'react-icons/fa';
import { toast } from "react-toastify";

const StudentRow = ({ studentData = {} }) => {
  return (
    <tr>
      <td className="ps-3">
        <div className="d-flex align-items-center position-relative">
          <div className="avatar avatar-md flex-shrink-0">
            {studentData?.pfpImg ? (
              <img
                src={studentData?.pfpImg}
                className="rounded-circle"
                alt={'avatar'}
              />
            ) : (
              <div className="avatar-img rounded-circle border-white border-3 shadow d-flex align-items-center justify-content-center bg-light text-dark fw-bold fs-4">
                {(studentData?.name?.[0] || "S").toUpperCase()}
              </div>
            )}
          </div>
          <div className="mb-0 ms-2">
            <h6 className="mb-0">
              <a href={`/instructor/students/${studentData?._id}`}>{studentData?.name}</a>
            </h6>
          </div>
        </div>
      </td>
      <td className="text-center d-none d-md-table-cell">
        {studentData?.coursesJoined || "-"}
      </td>
      <td className="text-center">
        {studentData?.isActivated === null ? (
          <div className="badge bg-secondary bg-opacity-10 text-secondary">
            -
          </div>
        ) : studentData?.isActivated ? (
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
          overlay={<Tooltip id={`tooltip-message-${studentData?._id}`}>Copy Email</Tooltip>}
        >
          <button
            type="button"
            className="btn btn-success-soft btn-round me-2 mb-0 flex-centered"
            onClick={() => {
              const email = studentData?.email;
              if (email) {
                navigator.clipboard.writeText(email);
                toast.success("Email copied!");
              } else {
                toast.error("No email found");
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
  const NUMBER_OF_COLUMNS = 4;
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
                  <option value="">Options</option>
                  <option value="nameAsc">A - Z</option>
                  <option value="nameDesc">Z - A</option>
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
                  <th scope="col" className="border-0 ps-3">
                    Student Name
                  </th>
                  <th scope="col" className="border-0 text-center d-none d-md-table-cell">
                    Courses Joined
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
