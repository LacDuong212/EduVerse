import useMyCourseDetail from './useMyCourseDetail';
import CourseStats from './components/CourseStats';
import CourseInfo from './components/CourseInfo';
import CourseStudentList from './components/CourseStudentList';
import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaAngleRight, FaRegEdit } from 'react-icons/fa';

const InstructorCourseDetail = () => {
  const { course, loading, error, refetch } = useMyCourseDetail();

  if (loading) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center mt-5">
        Loading...
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center mt-5">
        <h3>Error loading course</h3>
        <button onClick={refetch} className="btn btn-primary">Retry</button>
      </Container>
    );
  }

  return (
    <Container className="mt-3 mb-5">
      <Row className="mb-3 align-items-center">
        <Col xs={12} sm={8} md={9} className="">
          <div className="d-flex align-items-center">
            <h1 className="h3 mb-0 text-wrap">{course?.title || '(No title)'}</h1>
            <Link
              to={`/instructor/courses/edit/${course?.courseId}`}
              className="ms-xs-0 ms-sm-3 mb-0 btn btn-primary-soft rounded-circle p-2 flex-shrink-0"
            >
              <FaRegEdit className="fs-4 p-1" />
            </Link>
          </div>
        </Col>
        <Col xs={12} sm={4} md={3} className="text-end">
          {(course?.status?.toLowerCase() === 'live') && (
            <Link className="fw-bold" to={course?.courseId ? `/courses/${course.courseId}` : "/courses"}>
              View Public Details<FaAngleRight className="fs-5 mb-1" />
            </Link>
          )}
        </Col>
      </Row>
      <Row className="g-4">
        <CourseInfo col={7} courseData={course} />
        <CourseStats col={5} courseId={course?.courseId} />
        <CourseStudentList col={12} courseId={course?.courseId} />
      </Row>
    </Container>
  );
};

export default InstructorCourseDetail;
