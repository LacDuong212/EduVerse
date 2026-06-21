import { formatCurrency } from "@/utils/currency";
import { Col, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import { FaClock } from "react-icons/fa";

const StatBox = ({ id, label, tooltip, value, valueClass, borderClass }) => (
  <OverlayTrigger placement="top" overlay={<Tooltip id={id}>{tooltip}</Tooltip>}>
    <div className={`text-center p-4 border border-1 ${borderClass} rounded-3`} style={{ cursor: "default" }}>
      <h6 className="text-body">{label}</h6>
      <h3 className={`mb-0 fs-1 ${valueClass}`}>{value}</h3>
    </div>
  </OverlayTrigger>
);

const EarningCards = ({
  thisMonthEarning,
  toBePaid,
  totalEarning,
  totalPaid,
  approvedAmount,
}) => {
  const fmt = (v) => (v == null ? "—" : formatCurrency(v));

  return (
    <div className="vstack gap-3">
      <Row className="g-4">
        <Col sm={6} lg={3}>
          <StatBox
            id="tip-month"
            label="This Month Earning"
            tooltip="Net revenue earned this month after 20% platform fee."
            value={fmt(thisMonthEarning)}
            valueClass="text-primary"
            borderClass="border-primary"
          />
        </Col>
        <Col sm={6} lg={3}>
          <StatBox
            id="tip-total"
            label="Total Earning"
            tooltip="Lifetime net earnings after 20% platform fee deducted from every sale."
            value={fmt(totalEarning)}
            valueClass=""
            borderClass="border-secondary"
          />
        </Col>
        <Col sm={6} lg={3}>
          <StatBox
            id="tip-balance"
            label="Available Balance"
            tooltip="Maximum amount you can request for payout right now (Total Earning minus already requested amounts)."
            value={fmt(toBePaid)}
            valueClass="text-warning"
            borderClass="border-warning"
          />
        </Col>
        <Col sm={6} lg={3}>
          <StatBox
            id="tip-withdrawn"
            label="Total Withdrawn"
            tooltip="Total amount from payout requests that have been confirmed and transferred to your bank account."
            value={fmt(totalPaid)}
            valueClass="text-success"
            borderClass="border-success"
          />
        </Col>
      </Row>

      {approvedAmount > 0 && (
        <div
          className="d-flex align-items-center gap-2 rounded-3 px-3 py-2"
          style={{
            background: "rgba(var(--bs-info-rgb), 0.07)",
            border: "1px solid rgba(var(--bs-info-rgb), 0.25)",
            fontSize: "0.82rem",
          }}
        >
          <FaClock className="text-info flex-shrink-0" size={13} />
          <span className="text-body">
            <span className="fw-semibold text-info">{formatCurrency(approvedAmount)}</span>
            {" "}has been approved and is pending bank transfer. Your Available Balance will update once the transfer is confirmed.
          </span>
        </div>
      )}
    </div>
  );
};

export default EarningCards;
