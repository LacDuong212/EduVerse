import { Col, Row } from "react-bootstrap";
import CountUp from "react-countup";

const Counter = ({ stats }) => {
  const colXs = 4;
  const colSm = 3;
  const colMd = 2;

  return (
    <Row className="justify-content-center gap-2 text-center">
      <Col xs={colXs} sm={colSm} md={colMd}>
        <div>
          <h4 className="fw-bold mb-0">
            <CountUp end={stats?.totalDraft} delay={1} />
          </h4>
          <div
            className={`fs-6 badge bg-info`}
          >
            Draft
          </div>
        </div>
      </Col>
      <Col xs={colXs} sm={colSm} md={colMd}>
        <div>
          <h4 className="fw-bold mb-0">
            <CountUp end={stats?.totalLive} delay={1} />
          </h4>
          <div
            className={`fs-6 badge bg-success`}
          >
            Live
          </div>
        </div>
      </Col>
      <Col xs={colXs} sm={colSm} md={colMd}>
        <div>
          <h4 className="fw-bold mb-0">
            <CountUp end={stats?.totalPending} delay={1} />
          </h4>
          <div
            className={`fs-6 badge bg-warning`}
          >
            Pending
          </div>
        </div>
      </Col>
      <Col xs={colXs} sm={colSm} md={colMd}>
        <div>
          <h4 className="fw-bold mb-0">
            <CountUp end={stats?.totalRejected} delay={1} />
          </h4>
          <div
            className={`fs-6 badge bg-orange`}
          >
            Rejected
          </div>
        </div>
      </Col>
      <Col xs={colXs} sm={colSm} md={colMd}>
        <div>
          <h4 className="fw-bold mb-0">
            <CountUp end={stats?.totalBlocked} delay={1} />
          </h4>
          <div
            className={`fs-6 badge bg-danger`}
          >
            Blocked
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default Counter;
