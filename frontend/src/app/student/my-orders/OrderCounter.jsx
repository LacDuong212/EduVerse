// src/app/pages/student/orders/OrderCounter.jsx
import { Col, Row } from "react-bootstrap";
import CountUp from "react-countup";
import {
  FaShoppingBag,
  FaCheckCircle,
  FaClock,
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
          <CountUp end={count} delay={0.3} />
        </h5>
        <span className="mb-0 h6 fw-light">{title}</span>
      </div>
    </div>
  );
};

const OrderCounter = ({ stats, loading }) => {
  /**
   * stats shape (recommend):
   * {
   *   total: number,
   *   completed: number,
   *   pending: number
   * }
   */
  const safe = stats || { total: 0, completed: 0, pending: 0 };

  const items = [
    {
      title: "Total Orders",
      count: loading ? 0 : safe.total,
      icon: FaShoppingBag,
      variant: "primary",
    },
    {
      title: "Completed Orders",
      count: loading ? 0 : safe.completed,
      icon: FaCheckCircle,
      variant: "success",
    },
    {
      title: "Pending Orders",
      count: loading ? 0 : safe.pending,
      icon: FaClock,
      variant: "warning",
    },
  ];

  return (
    <Row className="mb-4">
      {items.map((item, idx) => (
        <Col sm={6} lg={4} className="mb-3" key={idx}>
          <CounterCard {...item} />
        </Col>
      ))}
    </Row>
  );
};

export default OrderCounter;
