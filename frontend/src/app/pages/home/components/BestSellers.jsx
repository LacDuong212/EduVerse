import { Container, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import CommonCourseSlider from "@/components/CommonCourseSlider";

const BestSellers = () => {
  const coursesState = useSelector((s) => s.courses || {});
  const list = Array.isArray(coursesState["bestSellers"]) ? coursesState["bestSellers"] : [];

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
          <CommonCourseSlider courses={list} />
        </div>
      </Row>
    </Container>
  </section>;
};

export default BestSellers;