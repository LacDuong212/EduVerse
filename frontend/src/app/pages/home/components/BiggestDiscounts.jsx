import { Container, Row } from "react-bootstrap";
import CommonCourseSlider from "./CommonCourseSlider";

const BiggestDiscounts = () => {
  return <section className="pt-0">
    <Container>
      <Row className="mb-4 mx-auto text-center">
        <h2 className="fs-1">Biggest Discounts</h2>
        <p className="mb-0">Grab our best deals and save big on top-rated courses!</p>
      </Row>
      <Row>
        <div className="tiny-slider arrow-round arrow-blur arrow-hover">
          <CommonCourseSlider source="biggestDiscounts" />
        </div>
      </Row>
    </Container>
  </section>;
};

export default BiggestDiscounts;