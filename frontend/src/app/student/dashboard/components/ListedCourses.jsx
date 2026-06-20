import { useSelector } from "react-redux";
import { Container, Row, Col } from "react-bootstrap";
import CommonCourseSlider from "./CommonCourseSlider";

const ListedCourses = () => {
  const recommendedCourses = useSelector(
    (state) => state.courses?.recommended || []
  );

  if (!recommendedCourses.length) return null;

  return (
    <section className="border rounded mt-2 p-4">
      <Container className="p-0">
        <h5 className="text-body">Recommended for You</h5>
        <div className="tiny-slider arrow-round arrow-blur arrow-hover">
          <CommonCourseSlider courses={recommendedCourses} />
        </div>
      </Container>
    </section>
  );
};

export default ListedCourses;