import useMyCourseDetail from './useMyCourseDetail';
import CourseStats from './components/CourseStats';
import MarketingCourse from './components/MarketingCourse';
import CourseStudentList from './components/CourseStudentList';
import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const InstructorCourseDetail = () => {
  const { course, loading, error, refetch } = useMyCourseDetail();

  if (loading) {
    return <Container>Loading...</Container>;
  }

  if (error) {
    return (
      <Container>
        <h1>Error loading course</h1>
        <button onClick={refetch}>Retry</button>
      </Container>
    );
  }

  return (
    <Container className="mt-3 mb-5">
      <Row className="mb-3">
        <Col xs={12} className="d-sm-flex justify-content-between align-items-center">
          <h1 className="h3 mb-2 mb-sm-0">Course Details</h1>
          <Link to={`/instructor/courses/edit/${course?._id}`} className="btn btn-sm btn-primary mb-0">
            Edit Course
          </Link>
        </Col>
      </Row>
      <Row className="g-4">
        <MarketingCourse col={7} courseData={course} />
        <CourseStats col={5} courseId={course?._id} />
        <CourseStudentList col={12} courseId={course?._id} />
      </Row>
    </Container>
  );
};

export default InstructorCourseDetail;
