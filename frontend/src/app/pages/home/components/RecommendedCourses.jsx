import { useSelector } from 'react-redux';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import CourseCard from '@/components/CourseCard';


const RecommendedCourses = () => {
  const user = useSelector((state) => state.auth.userData);
  const recommendedCourses = useSelector((state) => state.courses?.recommended || []);

  if (!user || recommendedCourses.length === 0) {
    return null;
  }

  return (
    <section className="pt-0 mb-5">
      <Container>
        <Row className="mb-4">
          <Col lg={8} className="mx-auto text-center">
            <h2 className="fs-1">
              Recommended for You <i className="bi bi-stars text-warning"></i>
            </h2>
            <p className="mb-0 text-muted">
              Based on your learning history and interests, we think you'll love these.
            </p>
          </Col>
        </Row>

        <Row className="g-4">
          {recommendedCourses.map((course) => (
            <Col sm={6} lg={4} xl={3} key={course._id}>
              <div className="position-relative h-100">
                <CourseCard course={course} />

                <Badge bg="info" className="position-absolute top-0 start-0 m-2 shadow-sm">
                  AI Pick
                </Badge>

              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default RecommendedCourses;