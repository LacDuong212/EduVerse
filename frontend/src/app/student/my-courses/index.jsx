import { useEffect, useRef, useState } from "react";
import ChoicesFormInput from "@/components/form/ChoicesFormInput";
import PageMetaData from "@/components/PageMetaData";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  ProgressBar,
  Row,
} from "react-bootstrap";
import { BsArrowRepeat, BsJournalBookmark, BsPlayCircle } from "react-icons/bs";
import { FaAngleLeft, FaAngleRight, FaSearch } from "react-icons/fa";
import { useMyCourses } from "./useMyCourses";
import { useNavigate } from "react-router-dom";
import Counter from "./Counter";

const CourseRow = ({
  courseId,
  completedLectures,
  image,
  name,
  totalLectures,
  continueLectureId,
}) => {
  const navigate = useNavigate();

  const percentage =
    totalLectures > 0 ? Math.trunc((completedLectures * 100) / totalLectures) : 0;

  const gotoLearning = () => {
    if (continueLectureId) {
      navigate(`/student/courses/${courseId}?lecture=${continueLectureId}`);
      return;
    }

    navigate(`/student/courses/${courseId}`);
  };

  const gotoCourseDetail = () => {
    navigate(`/courses/${courseId}`);
  };

  return (
    <tr>
      <td>
        <div className="d-flex align-items-center">
          <div className="w-100px flex-shrink-0">
            <img src={image} className="rounded w-100" alt={name} />
          </div>

          <div className="flex-grow-1 ms-2 min-w-0">
            <h6 className="mb-1 text-truncate">
              <span
                className="text-decoration-none text-primary"
                style={{ cursor: "pointer" }}
                onClick={gotoCourseDetail}
              >
                {name}
              </span>
            </h6>

            <div>
              <div className="d-flex justify-content-end align-items-end mb-1">
                <h6 className="mb-0 text-end">{percentage}%</h6>
              </div>

              <ProgressBar
                now={percentage}
                className="progress progress-sm bg-opacity-10"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </div>
      </td>

      <td className="text-center">{totalLectures}</td>
      <td className="text-center">{completedLectures}</td>
      <td>
        {percentage === 100 ? (
          <Button
            className="icons-center"
            onClick={() => navigate(`/student/courses/${courseId}`)}
            variant="light"
            size="sm"
          >
            <BsArrowRepeat className="me-1" />
            Restart
          </Button>
        ) : (
          <Button
            variant="primary-soft"
            size="sm"
            className="icons-center"
            onClick={gotoLearning}
          >
            <BsPlayCircle className="me-1" />
            Continue
          </Button>
        )}
      </td>
    </tr>
  );
};

const MyCoursesEmptyState = ({ isSearching, onClearSearch }) => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-5 px-3">
      <div
        className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 mb-3"
        style={{ width: 88, height: 88 }}
      >
        <BsJournalBookmark className="text-primary" size={40} />
      </div>

      <h5 className="mb-2">
        {isSearching ? "No courses match your search" : "You haven’t enrolled in any courses yet"}
      </h5>
      <p className="text-body mb-4">
        {isSearching
          ? "Try a different keyword or clear the search to see all your courses."
          : "Explore our catalog and start learning something new today."}
      </p>

      {isSearching ? (
        <Button variant="outline-secondary" onClick={onClearSearch}>
          Clear search
        </Button>
      ) : (
        <Button variant="primary" onClick={() => navigate("/courses")}>
          Browse Courses
        </Button>
      )}
    </div>
  );
};

const StudentMyCourses = () => {
  const {
    courseData,
    pagination,
    loading,
    progressLoading,
    fetchMyCourses,
    stats,
    filters,
    handleSearch,
    handleSort,
  } = useMyCourses();

  const [searchText, setSearchText] = useState(filters.search || "");
  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const timer = setTimeout(() => {
      if (searchText !== filters.search) {
        handleSearch(searchText);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchText, filters.search, handleSearch]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchMyCourses(page);
    }
  };

  return (
    <>
      <PageMetaData title="My Courses" />

      <Card className="bg-transparent border rounded-3">
        <CardHeader className="bg-transparent border-bottom">
          <Row className="g-3 align-items-center justify-content-between">
            <Col md={8} lg={7}>
              <form
                className="rounded position-relative"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  className="form-control pe-5 bg-transparent"
                  type="search"
                  placeholder="Search course title"
                  aria-label="Search"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <button
                  className="bg-transparent p-2 position-absolute top-50 end-0 translate-middle-y border-0 text-primary-hover text-reset"
                  type="submit"
                >
                  <FaSearch className="fs-6" />
                </button>
              </form>
            </Col>

            <Col md={4} lg={3}>
              <ChoicesFormInput
                name="sort"
                className="form-select js-choice border-0 z-index-9 bg-transparent"
                value={filters.sort}
                onChange={(e) => handleSort(e?.target?.value || "")}
              >
                <option value="">Sort by</option>
                <option value="enrolledDesc">Latest Enrolled</option>
                <option value="enrolledAsc">Oldest Enrolled</option>
                <option value="activityDesc">Recent Activity</option>
                <option value="activityAsc">Oldest Activity</option>
                <option value="titleAsc">Title A-Z</option>
                <option value="titleDesc">Title Z-A</option>
              </ChoicesFormInput>
            </Col>
          </Row>
        </CardHeader>

        <CardBody>
          {!(courseData.length === 0 && !filters.search) && (
            <Counter stats={stats} loading={loading} />
          )}

          {(loading || progressLoading) && courseData.length === 0 ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-3">Loading your courses...</p>
            </div>
          ) : courseData.length === 0 ? (
            <MyCoursesEmptyState
              isSearching={!!filters.search}
              onClearSearch={() => {
                setSearchText("");
                handleSearch("");
              }}
            />
          ) : (
            <div className="table-responsive border-0">
              <table className="table table-dark-gray align-middle p-4 mb-0 table-hover">
                <thead>
                  <tr>
                    <th scope="col">Course Title</th>
                    <th scope="col" className="text-center">
                      Total Lectures
                    </th>
                    <th scope="col" className="text-center">
                      Completed Lectures
                    </th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {courseData.map((item) => (
                    <CourseRow key={item.courseId} {...item} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && pagination.totalPages > 1 && (
            <div className="d-sm-flex justify-content-sm-between align-items-sm-center mt-4">
              <p className="mb-0 text-center text-sm-start">
                Showing page {pagination.page} of {pagination.totalPages}
              </p>

              <ul className="pagination pagination-sm pagination-primary-soft mb-0">
                <li className={`page-item ${pagination.page === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    <FaAngleLeft />
                  </button>
                </li>

                {Array.from({ length: pagination.totalPages }).map((_, i) => (
                  <li
                    key={i}
                    className={`page-item ${pagination.page === i + 1 ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}

                <li
                  className={`page-item ${
                    pagination.page === pagination.totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    <FaAngleRight />
                  </button>
                </li>
              </ul>
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
};

export default StudentMyCourses;