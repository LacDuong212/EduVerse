import { Button, Col, Row, Spinner } from "react-bootstrap";
import CourseCard from "@/components/CourseCard";
import useInstructorPublicCourses from "./useInstructorPublicCourses";
import { FaRotateRight } from "react-icons/fa6";

const CoursesList = ({ insId = null }) => {
  const {
    courses,
    loading,
    loadingMore,
    hasMore,
    total,
    loadMore,
    error,
    refresh,
  } = useInstructorPublicCourses(insId, 6);

  const MyCourses = (
    <div className="d-flex align-items-center gap-2">
      <span className="h4 mb-0">Public Courses ({total})</span>
      <span>
        <Button
          variant="link"
          onClick={refresh}
          className="p-0 d-flex align-items-center mb-0"
        >
          <FaRotateRight className="fs-5 ms-1" />
        </Button>
      </span>
    </div>
  );

  if ((loading)) {
    return (
      <>
        {MyCourses}
        <div className="d-flex justify-content-center align-items-center h-100" style={{ minHeight: 120 }}>
          <Spinner
            animation="border"
            variant="primary"
            style={{ width: "30px", height: "30px" }}
          />
        </div>
      </>
    );
  }

  if (courses.length === 0 || error) return MyCourses;

  return (
    <>
      {MyCourses}

      <Row className="g-4 mt-0">
        {courses.map((course, idx) => (
          <Col sm={6} key={course._id || idx}>
            <CourseCard course={course} />
          </Col>
        ))}
      </Row>

      {hasMore && (
        <div className="text-center mt-4">
          <Button
            variant="primary-soft"
            onClick={loadMore}
            disabled={loadingMore}
            className="mb-0"
          >
            {loadingMore ? (
              <>
                <Spinner animation="border" size="sm" />
              </>
            ) : (
              "More"
            )}
          </Button>
        </div>
      )}
    </>
  );
};

export default CoursesList;