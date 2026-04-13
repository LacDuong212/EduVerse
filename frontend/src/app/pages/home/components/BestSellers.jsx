import { Container, Row } from "react-bootstrap";
import CommonCourseSlider from "./CommonCourseSlider";

const BestSellers = () => {
  return <section className="pt-0">
    <Container>
      <Row className="mb-4 mx-auto text-center">
        <h2 className="fs-1">Best Seller Courses</h2>
        <p className="mb-0">
          Explore our most popular courses loved by thousands of learners worldwide.
        </p>
      </Row>
      <Row>
        <div className="tiny-slider arrow-round arrow-blur arrow-hover">
          <CommonCourseSlider source="bestSellers" />
        </div>
      </Row>
    </Container>
  </section>;
};

export default BestSellers;