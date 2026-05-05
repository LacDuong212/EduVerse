import { Col, Row } from "react-bootstrap";
import CountUp from "react-countup";
import {
  FaBookOpen,
  FaCheckCircle,
  FaPlayCircle,
  FaRegClock,
} from "react-icons/fa";

const CounterCard = ({ count, title, icon: Icon, variant }) => {
  return (
    <div
      className={`d-flex justify-content-center align-items-center p-4 bg-${variant} bg-opacity-15 rounded-3`}
    >
      <span className={`display-6 text-${variant} mb-0`}>
        {Icon && <Icon size={56} className="fa-fw" />}
      </span>

      <div className="ms-4">
        <h5 className="mb-0 fw-bold">
          <CountUp end={Number(count) || 0} delay={0.5} />
        </h5>
        <span className="mb-0 h6 fw-light">{title}</span>
      </div>
    </div>
  );
};

const Counter = ({ stats, loading }) => {
  const safe = stats || {
    total: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
  };

  return (
    <>
      <Row className="mb-3">
        <Col xs={12}>
          <CounterCard
            title="Total Courses"
            count={loading ? 0 : safe.total}
            icon={FaBookOpen}
            variant="primary"
          />
        </Col>
      </Row>

      <Row className="mb-4">
        <Col sm={6} lg={4} className="mb-3">
          <CounterCard
            title="Completed Courses"
            count={loading ? 0 : safe.completed}
            icon={FaCheckCircle}
            variant="success"
          />
        </Col>

        <Col sm={6} lg={4} className="mb-3">
          <CounterCard
            title="In Progress"
            count={loading ? 0 : safe.inProgress}
            icon={FaPlayCircle}
            variant="warning"
          />
        </Col>

        <Col sm={6} lg={4} className="mb-3">
          <CounterCard
            title="Not Started"
            count={loading ? 0 : safe.notStarted}
            icon={FaRegClock}
            variant="secondary"
          />
        </Col>
      </Row>
    </>
  );
};

export default Counter;