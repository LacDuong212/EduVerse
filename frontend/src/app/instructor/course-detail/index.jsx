import { Col, Container, Row, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaAngleRight, FaRegEdit } from "react-icons/fa";
import CourseStats from "./components/CourseStats";
import CourseInfo from "./components/CourseInfo";
import CourseStudents from "./components/CourseStudentList";
import useCourseDetails from "./useCourseDetails";

const InstructorCourseDetail = () => {
  const { course, loading, error, refetch } = useCourseDetails();

  if (loading) {
    return (
      <div className="position-absolute top-50 start-50 translate-middle">
        <Spinner
          animation="border"
          variant="primary"
          style={{ width: "30px", height: "30px" }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="position-absolute top-50 start-50 translate-middle d-flex flex-column align-items-center justify-content-center">
        <h3>Error loading Course Details..</h3>
        <button onClick={refetch} className="btn btn-primary-soft">Retry</button>
      </Container>
    );
  }

  return (
    <Container className="mt-3 mb-5">
      <Row className="mb-3 align-items-center">
        <Col xs={12} sm={8} md={9}>
          <div className="d-flex align-items-center">
            <h1 className="h3 mb-0 text-wrap">{course?.title || "(No title)"}</h1>
            <Link
              to={`/instructor/courses/edit/${course?.courseId}`}
              className="ms-xs-0 ms-sm-3 mb-0 btn btn-primary-soft rounded-circle p-2 flex-shrink-0"
            >
              <FaRegEdit className="fs-4 p-1" />
            </Link>
          </div>
        </Col>
        <Col xs={12} sm={4} md={3} className="text-end">
          {(course?.status?.toLowerCase() === "live") && (
            <Link className="fw-bold" to={course?.courseId ? `/courses/${course.courseId}` : "/courses"}>
              View Public Details<FaAngleRight className="fs-5 mb-1" />
            </Link>
          )}
        </Col>
      </Row>
      <Row className="g-4">
        <CourseInfo col={7} course={course} />
        <CourseStats col={5} courseId={course?.courseId} />
        <CourseStudents col={12} />
      </Row>
    </Container>
  );
};

export default InstructorCourseDetail;