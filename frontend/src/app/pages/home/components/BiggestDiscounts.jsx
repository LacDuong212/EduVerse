import { Container, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import CommonCourseSlider from "@/components/CommonCourseSlider";

const BiggestDiscounts = () => {
  const coursesState = useSelector((s) => s.courses || {});
  const list = Array.isArray(coursesState["biggestDiscounts"]) ? coursesState["biggestDiscounts"] : [];

  return <section className="pt-0">
    <Container>
      <Row className="mb-4 mx-auto text-center">
        <h2 className="fs-1">Biggest Discounts</h2>
        <p className="mb-0">Grab our best deals and save big on top-rated courses!</p>
      </Row>
      <Row>
        <div className="tiny-slider arrow-round arrow-blur arrow-hover">
          <CommonCourseSlider courses={list} />
        </div>
      </Row>
    </Container>
  </section>;
};

export default BiggestDiscounts;