import { Col, Container, Row } from 'react-bootstrap';
import TrendingCourseSlider from './TrendingCourseSlider';
const TrendingCourses = () => {
  return <section className="pb-5 pt-0 pt-lg-5">
    <Container>
      <Row className="mb-4">
        <Col lg={8} className="mx-auto text-center">
          <h2 className="fs-1">Biggest Discounts</h2>
          <p className="mb-0">Grab our best deals and save big on top-rated courses!</p>
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <div className="tiny-slider arrow-round arrow-blur arrow-hover">
            <TrendingCourseSlider />
          </div>
        </Col>
      </Row>
    </Container>
  </section>;
};
export default TrendingCourses;
