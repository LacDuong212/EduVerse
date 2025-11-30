import { Col, Row } from 'react-bootstrap';
import CountUp from 'react-countup';
import { BsLightningCharge, BsPauseCircle } from "react-icons/bs";
import { FaUserGraduate } from "react-icons/fa";

const Counter = ({ totalStudents = 0 , activeStudents = 0 , inactiveStudents = 0 }) => {
  return (
    <Row className="justify-content-center text-center">
      <Col>
        <div className="d-flex justify-content-center gap-4 flex-wrap">
          <div className="d-flex align-items-center">
            <div className="icon-lg fs-4 text-info bg-info bg-opacity-25 rounded flex-centered">
              <FaUserGraduate />
            </div>
            <div className="ms-3 text-start">
              <h4 className="purecounter fw-bold mb-0">
                <CountUp end={totalStudents} delay={1} />
              </h4>
              <div>Total Students</div>
            </div>
          </div>

          <div className="d-flex align-items-center">
            <div className="icon-lg fs-4 text-success bg-success bg-opacity-25 rounded flex-centered">
              <BsLightningCharge />
            </div>
            <div className="ms-3 text-start">
              <h4 className="purecounter fw-bold mb-0">
                <CountUp end={activeStudents} delay={1} />
              </h4>
              <div>Active Students</div>
            </div>
          </div>

          <div className="d-flex align-items-center">
            <div className="icon-lg fs-4 text-warning bg-warning bg-opacity-25 rounded flex-centered">
              <BsPauseCircle />
            </div>
            <div className="ms-3 text-start">
              <h4 className="purecounter fw-bold mb-0">
                <CountUp end={inactiveStudents} delay={1} />
              </h4>
              <div>Inactive Students</div>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default Counter;
