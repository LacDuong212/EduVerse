import { Row, Col } from "react-bootstrap";

const Box = ({ height = 100, className = "" }) => (
  <div className={`placeholder-glow ${className}`}>
    <span
      className="placeholder col-12 rounded"
      style={{ height, display: "block" }}
    />
  </div>
);

const DashboardSkeleton = () => {
  return (
    <div>
      {/* Stats cards */}
      <Row className="g-3 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Col xs={6} xl={3} key={i}>
            <Box height={78} />
          </Col>
        ))}
      </Row>

      {/* Main grid */}
      <Row className="g-3 mb-4">
        <Col xs={12} lg={8} className="d-flex flex-column gap-3">
          <Box height={160} />
          <Box height={400} />
        </Col>
        <Col xs={12} lg={4} className="d-flex flex-column gap-3">
          <Box height={140} />
          <Box height={260} />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardSkeleton;
