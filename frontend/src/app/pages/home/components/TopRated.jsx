import { Col, Container, Row } from 'react-bootstrap';
import CommonCourseSlider from './CommonCourseSlider';


const TopRatedSection = () => {
  return <section className="pt-0">
    <Container>
      <Row className="mb-4">
        <Col lg={8} className="mx-auto text-center">
          <h2 className="fs-1">Top Rated Courses</h2>
          <p className="mb-0">
            Explore our most popular courses loved by thousands of learners worldwide.
          </p>
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <div className="tiny-slider arrow-round arrow-blur arrow-hover">
            <CommonCourseSlider source="topRated" />
          </div>
        </Col>
      </Row>
    </Container>
  </section>;
};
export default TopRatedSection;
