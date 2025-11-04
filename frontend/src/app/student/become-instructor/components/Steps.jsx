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
            <p className="mb-0">
              As it so contrasted oh estimating instrument. Size like body someone had. Are conduct viewing boy minutes warrant the expense? Tolerably
              behavior may admit daughters offending her ask own. Praise effect wishes change way and any wanted.
            </p>
          </Col>
        </Row>
        <Row className="g-4 g-md-5">
          <Col md={4} className="text-center">
            <img src={createAccountImg} className="h-200px" alt="createAccountImg" />
            <h4 className="mt-3">Create Account</h4>
            <p className="text-truncate-2 mb-0">
              Satisfied conveying a dependent contented he gentleman agreeable do be. Delivered dejection necessary objection do Mr prevailed. Mr
              feeling does chiefly cordial in do
            </p>
          </Col>
          <Col md={4} className="text-center">
            <img src={addCourseImg} className="h-200px" alt="addCourseImg" />
            <h4 className="mt-3">Add your Course</h4>
            <p className="text-truncate-2 mb-0">
              Proceed how any engaged visitor. Explained propriety off out perpetual his you. Feel sold off felt nay rose met you. We so entreaties
              cultivated astonished is. Was sister for a few longer Mrs sudden talent become. Done may bore quit evil old mile. If likely am of beauty
              tastes.
            </p>
          </Col>
          <Col md={4} className="text-center">
            <img src={earnMoneyImg} className="h-200px" alt="earnMoneyImg" />
            <h4 className="mt-3">Start Earning Money</h4>
            <p className="text-truncate-2 mb-0">
              Insipidity the sufficient discretion imprudence resolution sir him decisively. Delivered dejection necessary objection do Mr prevailed.
              Mr feeling does chiefly cordial in do
            </p>
          </Col>
        </Row>
      </Container>
    </section>;
};
export default Steps;
