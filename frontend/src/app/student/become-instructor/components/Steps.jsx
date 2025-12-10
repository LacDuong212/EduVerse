import addCourseImg from '@/assets/images/element/add-course.svg';
import createAccountImg from '@/assets/images/element/create-account.svg';
import earnMoneyImg from '@/assets/images/element/earn-money.svg';
import { Col, Container, Row } from 'react-bootstrap';
const Steps = () => {
  return <section>
      <Container>
        <Row className="mb-4">
          <Col sm={10} xl={6} className="text-center mx-auto">
            <h2>You can be your guiding star with our help</h2>
          </Col>
        </Row>
        <Row className="g-4 g-md-5">
          <Col md={4} className="text-center">
            <img src={createAccountImg} className="h-200px" alt="createAccountImg" />
            <h4 className="mt-3">Create Account</h4>
          </Col>
          <Col md={4} className="text-center">
            <img src={addCourseImg} className="h-200px" alt="addCourseImg" />
            <h4 className="mt-3">Add your Course</h4>
          </Col>
          <Col md={4} className="text-center">
            <img src={earnMoneyImg} className="h-200px" alt="earnMoneyImg" />
            <h4 className="mt-3">Start Earning Money</h4>
          </Col>
        </Row>
      </Container>
    </section>;
};
export default Steps;
