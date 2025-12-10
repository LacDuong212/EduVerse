import { useSelector } from 'react-redux';
import { Container, Row, Col } from 'react-bootstrap';
import CourseCard from '@/components/CourseCard';

const NewestCourses = () => {
  const newestCourses = useSelector((s) => s.courses?.newest || []);

  return (
    <section className='pt-0'>
      <Container>
        <Row className="mb-4">
          <Col lg={8} className="mx-auto text-center">
            <h2 className="fs-1">Newest Courses</h2>
            <p className="mb-0">
              Discover our latest courses and stay ahead with fresh, updated content.
            </p>
          </Col>
        </Row>

        <Row className="g-4">
          {newestCourses.map((course) => (
            <Col sm={6} lg={4} xl={3} key={course._id}>
              <CourseCard course={course} />
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default NewestCourses;
