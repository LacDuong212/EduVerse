import { formatCurrency } from "@/utils/currency";
import { Col, Row } from "react-bootstrap";

const EarningCards = ({
  thisMonthRevenue,
  toBePaid,
  totalEarning
}) => {
  const format = (value) => {
    if (!value && value !== 0) return "-";
    else return formatCurrency(value);
  };

  return (
    <Row className="g-4">
      <Col sm={6} lg={4}>
        <div className="text-center p-4 border border-1 border-secondary rounded-3">
          <h6 className="text-body">Total Earning</h6>
          <h3 className="mb-0 fs-1">{format(totalEarning)}</h3>
        </div>
      </Col>
      <Col sm={6} lg={4}>
        <div className="text-center p-4 border border-1 border-primary rounded-3">
          <h6 className="text-body">This Month Revenue</h6>
          <h3 className="mb-0 fs-1 text-primary">{format(thisMonthRevenue)}</h3>
        </div>
      </Col>
      <Col sm={6} lg={4}>
        <div className="text-center p-4 border border-1 border-success rounded-3">
          <h6 className="text-body">To Be Paid</h6>
          <h3 className="mb-0 fs-1 text-success">{format(toBePaid)}</h3>
        </div>
      </Col>
    </Row>
  );
};

export default EarningCards;