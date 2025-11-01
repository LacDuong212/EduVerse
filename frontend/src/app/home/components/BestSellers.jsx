import { Col, Container, Row } from 'react-bootstrap';
import BestSellersCourseSlider from './BestSellersSlider';
const BestSellersSection = () => {
  return <section className="pb-5 pt-0 pt-lg-5">
    <Container>
      <Row className="mb-4">
        <Col lg={8} className="mx-auto text-center">
          <h2 className="fs-1">Best Seller Courses</h2>
          <p className="mb-0">
            Explore our most popular courses loved by thousands of learners worldwide.
          </p>
        </Col>
      </Row>
      <Row>
        <Col lg={12}>
          <div className="tiny-slider arrow-round arrow-blur arrow-hover">
            <BestSellersCourseSlider />
          </div>
        </Col>
      </Row>
    </Container>
  </section>;
};
export default BestSellersSection;
