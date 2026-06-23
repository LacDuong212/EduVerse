import { Badge, Pagination, Spinner, Table } from "react-bootstrap";
import { formatCurrency } from "@/utils/currency";

const STATUS_VARIANT = { pending: "warning", paid: "success", approved: "success", rejected: "danger" };
const STATUS_LABEL   = { pending: "Pending", paid: "Paid", approved: "Paid", rejected: "Rejected" };

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

export default function PayoutHistoryTable({ payouts, loading, pagination, page, onPageChange }) {
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" size="sm" className="text-body" style={{ opacity: 0.4 }} />
      </div>
    );
  }

  if (!payouts.length) {
    return (
      <div className="text-center py-5 text-body" style={{ opacity: 0.45 }}>
        <div className="fw-semibold mb-1">No payout requests yet</div>
        <div className="small">Submit your first request using the button above.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="table-responsive">
        <Table hover className="align-middle mb-0">
          <thead>
            <tr>
              <th className="text-body small fw-semibold" style={{ opacity: 0.6 }}>Period</th>
              <th className="text-body small fw-semibold" style={{ opacity: 0.6 }}>Amount</th>
              <th className="text-body small fw-semibold" style={{ opacity: 0.6 }}>Bank</th>
              <th className="text-body small fw-semibold" style={{ opacity: 0.6 }}>Status</th>
              <th className="text-body small fw-semibold" style={{ opacity: 0.6 }}>Submitted</th>
              <th className="text-body small fw-semibold" style={{ opacity: 0.6 }}>Processed</th>
              <th className="text-body small fw-semibold" style={{ opacity: 0.6 }}>Note</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr key={p.id}>
                <td className="text-body small">{p.periodLabel || "—"}</td>
                <td className="fw-semibold text-body">{formatCurrency(p.amount)}</td>
                <td>
                  <div className="text-body small">{p.bankInfo?.bankName}</div>
                  <div className="text-body small" style={{ opacity: 0.5 }}>{p.bankInfo?.accountNumber}</div>
                </td>
                <td>
                  <Badge bg={STATUS_VARIANT[p.status] || "secondary"}>
                    {STATUS_LABEL[p.status] || p.status}
                  </Badge>
                </td>
                <td className="text-body small">{formatDate(p.createdAt)}</td>
                <td className="text-body small">{formatDate(p.processedAt)}</td>
                <td className="text-body small" style={{ opacity: 0.6, maxWidth: 160 }}>
                  {p.adminNote || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-center pt-3">
          <Pagination size="sm" className="mb-0">
            <Pagination.Prev disabled={page <= 1} onClick={() => onPageChange(page - 1)} />
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <Pagination.Item key={p} active={p === page} onClick={() => onPageChange(p)}>
                {p}
              </Pagination.Item>
            ))}
            <Pagination.Next disabled={page >= pagination.totalPages} onClick={() => onPageChange(page + 1)} />
          </Pagination>
        </div>
      )}
    </div>
  );
}
