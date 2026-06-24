import { formatCurrency } from "@/utils/currency";
import { Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";

const StatBox = ({ id, label, tooltip, value, valueClass, borderClass }) => (
  <OverlayTrigger placement="top" overlay={<Tooltip id={id}>{tooltip}</Tooltip>}>
    <div className={`text-center p-4 border border-1 ${borderClass} rounded-3`} style={{ cursor: "default" }}>
      <h6 className="text-body">{label}</h6>
      <h3 className={`mb-0 fs-1 ${valueClass}`}>{value}</h3>
    </div>
  </OverlayTrigger>
);

const EarningCards = ({ thisMonthEarning, toBePaid, totalEarning, totalPaid }) => {
  const fmt = (v) => (v == null ? "—" : formatCurrency(v));

  return (
    <Row className="g-4">
      <Col sm={6}>
        <StatBox
          id="tip-month"
          label="This Month Earning"
          tooltip="Net revenue earned this month after 20% platform fee."
          value={fmt(thisMonthEarning)}
          valueClass="text-primary"
          borderClass="border-primary"
        />
      </Col>
      <Col sm={6}>
        <StatBox
          id="tip-total"
          label="Total Earning"
          tooltip="Lifetime net earnings after 20% platform fee deducted from every sale."
          value={fmt(totalEarning)}
          valueClass=""
          borderClass="border-secondary"
        />
      </Col>
      <Col sm={6}>
        <StatBox
          id="tip-balance"
          label="Available Balance"
          tooltip="Maximum amount you can request for payout right now (Total Earning minus already withdrawn amounts)."
          value={fmt(toBePaid)}
          valueClass="text-warning"
          borderClass="border-warning"
        />
      </Col>
      <Col sm={6}>
        <StatBox
          id="tip-withdrawn"
          label="Total Withdrawn"
          tooltip="Total amount confirmed and transferred to your bank account."
          value={fmt(totalPaid)}
          valueClass="text-success"
          borderClass="border-success"
        />
      </Col>
    </Row>
  );
};

export default EarningCards;
