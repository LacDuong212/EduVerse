import { Container, Row, Col } from 'react-bootstrap';
import useCourseDetail from '../useCourseDetail';
import CommonCourseSlider from './CommonCourseSlider';

const ListedCourses = () => {
  const { relatedCourses } = useCourseDetail();

  if (!relatedCourses || relatedCourses.length === 0) return null;

  return (
    <section className="pt-0">
      <Container>
        <Row className="mb-4">
          <Col lg={12}>
             <h2 className="mb-0">Related Courses</h2>
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <div className="tiny-slider arrow-round arrow-blur arrow-hover">
              <CommonCourseSlider courses={relatedCourses} />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ListedCourses;