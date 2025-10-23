import { Col, Container, Row } from 'react-bootstrap';
import { BsPatchExclamationFill } from 'react-icons/bs';
import { FaGlobe, FaSignal, FaStar, FaUserGraduate } from 'react-icons/fa';
const PageIntro = () => {
  return <section className="bg-light py-0 py-sm-5">
      <Container>
        <Row className="py-5">
          <Col lg={8}>
            <h6 className="mb-3 font-base bg-primary text-white py-2 px-4 rounded-2 d-inline-block">Digital Marketing</h6>
            <h1>The Complete Digital Marketing Course - 12 Courses in 1</h1>
            <p>
              Satisfied conveying a dependent contented he gentleman agreeable do be. Warrant private blushes removed an in equally totally if.
              Delivered dejection necessary objection do Mr prevailed. Mr feeling does chiefly cordial in do.
            </p>
            <ul className="list-inline mb-0">
              <li className="list-inline-item h6 me-3 mb-1 mb-sm-0 icons-center">
                <FaStar className="text-warning me-2" />
                4.5/5.0
              </li>
              <li className="list-inline-item h6 me-3 mb-1 mb-sm-0 icons-center">
                <FaUserGraduate className="text-orange me-2" />
                12k Enrolled
              </li>
              <li className="list-inline-item h6 me-3 mb-1 mb-sm-0 icons-center">
                <FaSignal size={16} className="text-success me-2" />
                All levels
              </li>
              <li className="list-inline-item h6 me-3 mb-1 mb-sm-0 icons-center">
                <BsPatchExclamationFill className="text-danger me-2" />
                Last updated 09/2021
              </li>
              <li className="list-inline-item h6 mb-0 icons-center">
                <FaGlobe className="text-info me-2" />
                English
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </section>;
};
export default PageIntro;
