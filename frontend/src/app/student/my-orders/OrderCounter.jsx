import { Col, Row } from "react-bootstrap";
import CountUp from "react-countup";
import {
  FaShoppingBag,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";

const CounterCard = ({ count, title, icon: Icon, variant }) => (
  <div
    className={`d-flex justify-content-center align-items-center p-4 bg-${variant} bg-opacity-15 rounded-3`}
  >
    <span className={`display-6 text-${variant} mb-0`}>
      {Icon && <Icon size={56} className="fa-fw" />}
    </span>

    <div className="ms-4">
      <h5 className="mb-0 fw-bold">
        <CountUp end={count} delay={0.3} />
      </h5>
      <span className="mb-0 h6 fw-light">{title}</span>
    </div>
  </div>
);

const OrderCounter = ({ stats, loading }) => {
  const safe = stats || {
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
  };

  return (
    <>
      <Row className="mb-3">
        <Col xs={12}>
          <CounterCard
            title="Total Orders"
            count={loading ? 0 : safe.total}
            icon={FaShoppingBag}
            variant="primary"
          />
        </Col>
      </Row>

      <Row className="mb-4">
        <Col sm={6} lg={4} className="mb-3">
          <CounterCard
            title="Completed"
            count={loading ? 0 : safe.completed}
            icon={FaCheckCircle}
            variant="success"
          />
        </Col>

        <Col sm={6} lg={4} className="mb-3">
          <CounterCard
            title="Pending"
            count={loading ? 0 : safe.pending}
            icon={FaClock}
            variant="warning"
          />
        </Col>

        <Col sm={6} lg={4} className="mb-3">
          <CounterCard
            title="Cancelled"
            count={loading ? 0 : safe.cancelled}
            icon={FaTimesCircle}
            variant="danger"
          />
        </Col>
      </Row>
    </>
  );
};

export default OrderCounter;