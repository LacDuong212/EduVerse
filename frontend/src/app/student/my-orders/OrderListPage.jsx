import PageMetaData from "@/components/PageMetaData";
import { Button, Card, CardBody } from "react-bootstrap";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { BsArrowRepeat } from "react-icons/bs";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import useMyOrders from "./useMyOrders";
import { formatCurrency } from "@/utils/currency";
import { statusLabel, statusVariant } from "@/utils/order";
import OrderCounter from "./OrderCounter";

const shortOrderCode = (id) => {
  const s = String(id || "");
  if (!s) return "";
  return s.slice(-4).toUpperCase();
};

const OrderRow = ({ _id, createdAt, status, totalAmount, courses }) => {
  const navigate = useNavigate();

  const created = createdAt ? new Date(createdAt) : null;
  const createdText = created ? created.toLocaleString("vi-VN") : "N/A";
  const coursesCount = Array.isArray(courses) ? courses.length : 0;

  // ✅ NEW: lấy course đầu tiên (nếu backend populate courses.course)
  const firstItem = Array.isArray(courses) && courses.length > 0 ? courses[0] : null;
  const firstCourse = firstItem?.course || {};
  const firstTitle =
    firstCourse?.title || firstCourse?.name || "Untitled Course";
  const firstThumb =
    firstCourse?.thumbnail || firstCourse?.image || "";

  return (
    <tr>
      <td>
        <div className="d-flex align-items-center">
          {/* ✅ NEW: thumbnail */}
          <div
            className="rounded overflow-hidden bg-light flex-shrink-0"
            style={{ width: 72, height: 52 }}
          >
            {firstThumb ? (
              <img
                src={firstThumb}
                alt={firstTitle}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : null}
          </div>

          <div className="flex-grow-1 ms-2">
            {/* ✅ NEW: show first course title */}
            <h6 className="mb-1 text-truncate">
              <span
                className="text-decoration-none text-primary"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/student/orders/${_id}`)}
                title={firstTitle}
              >
                 {_id ? (
                <span >
                  Order #{shortOrderCode(_id)}
                </span>
              ) : null}
              </span>

              {/* nếu có nhiều hơn 1 course
              {coursesCount > 1 ? (
                <span className="text-secondary small ms-2">
                  +{coursesCount - 1} more
                </span>
              ) : null} */}
            </h6>
            <div className="text-secondary small fw-light fw-bold fa-fw">
              {coursesCount} course{coursesCount > 1 ? "s" : ""}
            </div>

            <div className="text-secondary small">
              {createdText}
            </div>
          </div>
        </div>
      </td>

      <td className="text-center">
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
  const { orders, loading, refetch, stats, pagination, fetchMyOrders } = useMyOrders();
  const [q, setQ] = useState("");

  // Search nhẹ: cho phép search bằng 4 ký tự cuối của orderId hoặc theo ngày (dd/mm/yyyy)
  const filtered = useMemo(() => {
    const keyword = (q || "").trim().toLowerCase();
    if (!keyword) return orders || [];

    return (orders || []).filter((o) => {
      const id4 = shortOrderCode(o?._id).toLowerCase();

      const created = o?.createdAt ? new Date(o.createdAt) : null;
      const dateStr = created ? created.toLocaleDateString("vi-VN").toLowerCase() : "";

      return id4.includes(keyword) || dateStr.includes(keyword);
    });
  }, [orders, q]);

  const handlePageChange = (page) => {
    if (!pagination || !fetchMyOrders) return;
    if (page >= 1 && page <= pagination.totalPages) fetchMyOrders(page);
  };

  return (
    <>
      <PageMetaData title="My Orders" />

      <Card className="bg-transparent border rounded-3">
        <CardBody>
          <OrderCounter stats={stats} loading={loading} />

          {/* Search + Refresh */}
          <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
            <div className="d-flex gap-2 align-items-center">
              <input
                className="form-control bg-transparent"
                style={{ width: 360, maxWidth: "100%" }}
                placeholder="Search by date (dd/mm) or Order # (last 4)..."
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
                      <td colSpan={4} className="text-center text-muted py-5">
                        You don’t have any orders yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
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

                <li className={`page-item ${pagination.page === pagination.totalPages && "disabled"}`}>
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
