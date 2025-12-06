import { formatCurrency } from '@/utils/currency';
import { Col, Row } from 'react-bootstrap';

const EarningsCards = ({
  thisMonthEarnings = 0,
  toBePaid = 0,
  lifeTimeEarnings = 0
}) => {
  return (
    <Row className="g-4">
      <Col sm={6} lg={4}>
        <div className="text-center p-4 border border-1 rounded-3">
          <h6 className="text-body">Lifetime Earning</h6>
          <h3 className="mb-0 fs-1">{formatCurrency(lifeTimeEarnings)}</h3>
        </div>
      </Col>
      <Col sm={6} lg={4}>
        <div className="text-center p-4 border border-1 border-primary rounded-3">
          <h6 className="text-body">This Month Earning</h6>
          <h3 className="mb-0 fs-1 text-primary">{formatCurrency(thisMonthEarnings)}</h3>
        </div>
      </Col>
      <Col sm={6} lg={4}>
        <div className="text-center p-4 border border-1 border-success rounded-3">
          <h6 className="text-body">To Be Paid</h6>
          <h3 className="mb-0 fs-1 text-success">{formatCurrency(toBePaid)}</h3>
        </div>
      </Col>
    </Row>
  );
};

export default EarningsCards;
