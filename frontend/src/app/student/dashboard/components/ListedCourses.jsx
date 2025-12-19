import { useSelector } from 'react-redux';
import { Container, Row, Col } from 'react-bootstrap';
import CommonCourseSlider from './CommonCourseSlider';

const ListedCourses = () => {
  const recommendedCourses = useSelector((state) => state.courses?.recommended || []);
  
  if (!recommendedCourses || recommendedCourses.length === 0) return null;

  return (
    <section className="border pt-3 mt-3">
      <Container>
        <Row className="mb-3">
          <Col lg={12}>
             <h5 className="mb-0 text-body">Recommended for You</h5>
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <div className="tiny-slider arrow-round arrow-blur arrow-hover">
              <CommonCourseSlider courses={recommendedCourses} />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ListedCourses;