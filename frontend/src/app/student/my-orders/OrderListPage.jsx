import PageMetaData from "@/components/PageMetaData";
import { Button, Card, CardBody } from "react-bootstrap";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { BsArrowRepeat } from "react-icons/bs";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import useMyOrders from "./useMyOrders";
import { formatCurrency } from "@/utils/currency";
import { paymentLabel, statusLabel, statusVariant } from "@/utils/order";
import OrderCounter from "./OrderCounter";

const OrderRow = ({
  _id,
  createdAt,
  paymentMethod,
  status,
  totalAmount,
  discountAmount,
}) => {
  const navigate = useNavigate();

  const created = createdAt ? new Date(createdAt) : null;

  return (
    <tr>
      <td>
        <div className="d-flex align-items-center">
          <div className="flex-grow-1">
            <h6 className="mb-1 text-truncate">
              <span
                className="text-decoration-none text-primary"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/student/orders/${_id}`)}
              >
                {_id}
              </span>
            </h6>

            <div className="text-muted small">
              {created ? created.toLocaleString("vi-VN") : "N/A"}
            </div>

            {Number(discountAmount || 0) > 0 ? (
              <div className="text-muted small">
                Discount: {formatCurrency(discountAmount)}
              </div>
            ) : null}
          </div>
        </div>
      </td>

      <td className="text-center">{paymentLabel(paymentMethod)}</td>

      <td className="text-center">
        {/* dùng badge bootstrap theo statusVariant */}
        <span className={`badge bg-${statusVariant(status)}`}>
          {statusLabel(status)}
        </span>
      </td>

      <td className="text-center fw-semibold">{formatCurrency(totalAmount)}</td>

      <td>
        <Button
          variant="primary-soft"
          size="sm"
          className="icons-center"
          onClick={() => navigate(`/student/orders/${_id}`)}
        >
          View Detail
        </Button>
      </td>
    </tr>
  );
};

export default function OrderListPage() {
  const navigate = useNavigate();
  const { orders, loading, refetch, stats, pagination, fetchMyOrders } =
    useMyOrders();

  const [q, setQ] = useState("");

  // filter theo Order ID (giữ nhẹ)
  const filtered = useMemo(() => {
    const keyword = (q || "").trim().toLowerCase();
    if (!keyword) return orders || [];
    return (orders || []).filter((o) =>
      String(o?._id || "").toLowerCase().includes(keyword)
    );
  }, [orders, q]);

  const handlePageChange = (page) => {
    // nếu hook bạn chưa có pagination/fetchMyOrders thì bỏ đoạn này
    if (!pagination || !fetchMyOrders) return;
    if (page >= 1 && page <= pagination.totalPages) {
      fetchMyOrders(page);
    }
  };

  return (
    <>
      <PageMetaData title="My Orders" />

      <Card className="bg-transparent border rounded-3">
        <CardBody>
          {/* Counter đồng bộ my course */}
          <OrderCounter stats={stats} loading={loading} />

          {/* Search + Refresh (nhẹ giống style của bạn) */}
          <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
            <div className="d-flex gap-2 align-items-center">
              <input
                className="form-control bg-transparent"
                style={{ width: 320, maxWidth: "100%" }}
                placeholder="Search by Order ID..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />

              <Button
                variant="primary-soft"
                size="sm"
                className="icons-center"
                onClick={refetch}
                disabled={loading}
              >
                <BsArrowRepeat className="me-1" />
                Refresh
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-3">Loading your orders...</p>
            </div>
          ) : (
            <div className="table-responsive border-0">
              <table className="table table-dark-gray align-middle p-4 mb-0 table-hover">
                <thead>
                  <tr>
                    <th scope="col">Order</th>
                    <th scope="col" className="text-center">
                      Payment
                    </th>
                    <th scope="col" className="text-center">
                      Status
                    </th>
                    <th scope="col" className="text-center">
                      Total
                    </th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((o, idx) => <OrderRow key={idx} {...o} />)
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-5">
                        You don’t have any orders yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination (giống My Courses) - chỉ render khi hook có pagination */}
          {!loading && pagination?.totalPages > 1 && (
            <div className="d-sm-flex justify-content-sm-between align-items-sm-center mt-4">
              <p className="mb-0 text-center text-sm-start">
                Showing page {pagination.page} of {pagination.totalPages}
              </p>

              <ul className="pagination pagination-sm pagination-primary-soft mb-0">
                <li className={`page-item ${pagination.page === 1 && "disabled"}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    <FaAngleLeft />
                  </button>
                </li>

                {Array.from({ length: pagination.totalPages }).map((_, i) => (
                  <li
                    key={i}
                    className={`page-item ${pagination.page === i + 1 ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}

                <li
                  className={`page-item ${pagination.page === pagination.totalPages && "disabled"}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    <FaAngleRight />
                  </button>
                </li>
              </ul>
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
}
