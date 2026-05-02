import PageMetaData from "@/components/PageMetaData";
import { Button, Card, CardBody, Form } from "react-bootstrap";
import { FaAngleLeft, FaAngleRight, FaSearch } from "react-icons/fa";
import { BsArrowRepeat } from "react-icons/bs";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import useMyOrders from "./useMyOrders";
import { formatCurrency } from "@/utils/currency";
import { statusLabel, statusVariant } from "@/utils/order";
import OrderCounter from "./OrderCounter";

const shortOrderCode = (id) => {
  const s = String(id || "");
  return s ? s.slice(-4).toUpperCase() : "";
};

const OrderRow = ({ orderId, createdAt, status, totalAmount, courses }) => {
  const navigate = useNavigate();

  const created = createdAt ? new Date(createdAt) : null;
  const createdText = created ? created.toLocaleString("vi-VN") : "N/A";
  const coursesCount = Array.isArray(courses) ? courses.length : 0;

  const firstItem = Array.isArray(courses) && courses.length > 0 ? courses[0] : null;
  const firstCourse = firstItem?.course || {};
  const firstTitle = firstCourse?.title || "Untitled Course";
  const firstThumb = firstCourse?.thumbnail || firstCourse?.image || "";

  return (
    <tr>
      <td>
        <div className="d-flex align-items-center">
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
            <h6 className="mb-1 text-truncate">
              <span
                className="text-decoration-none text-primary"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/student/orders/${orderId}`)}
                title={firstTitle}
              >
                Order #{shortOrderCode(orderId)}
              </span>
            </h6>

            <div className="text-secondary small fw-bold">
              {coursesCount} course{coursesCount > 1 ? "s" : ""}
            </div>

            <div className="text-secondary small">{createdText}</div>
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
          onClick={() => navigate(`/student/orders/${orderId}`)}
        >
          View Detail
        </Button>
      </td>
    </tr>
  );
};

export default function OrderListPage() {
  const {
    orders,
    loading,
    refetch,
    stats,
    pagination,
    fetchMyOrders,
    filters,
    handleSearch,
    handleSort,
    handleStatus,
  } = useMyOrders();

  const [q, setQ] = useState(filters.search || "");
  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const timer = setTimeout(() => {
      if (q !== filters.search) {
        handleSearch(q);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [q, filters.search, handleSearch]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchMyOrders(page);
    }
  };

  return (
    <>
      <PageMetaData title="My Orders" />

      <Card className="bg-transparent border rounded-3">
        <CardBody>
          <OrderCounter stats={stats} loading={loading} />

          <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
            <div className="d-flex gap-2 align-items-center flex-wrap">
              <div className="position-relative">
                <input
                  className="form-control bg-transparent pe-5"
                  style={{ width: 360, maxWidth: "100%" }}
                  placeholder="Search by order ID or first course title..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
                <FaSearch
                  className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                />
              </div>

              <Form.Select
                style={{ width: 180 }}
                value={filters.sort}
                onChange={(e) => handleSort(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="totalAsc">Total low to high</option>
                <option value="totalDesc">Total high to low</option>
                <option value="statusAsc">Status A-Z</option>
                <option value="statusDesc">Status Z-A</option>
              </Form.Select>

              <Form.Select
                style={{ width: 160 }}
                value={filters.status}
                onChange={(e) => handleStatus(e.target.value)}
              >
                <option value="">All status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </Form.Select>

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
                  {orders.length > 0 ? (
                    orders.map((o) => <OrderRow key={o.orderId} {...o} />)
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

          {!loading && pagination?.totalPages > 1 && (
            <div className="d-sm-flex justify-content-sm-between align-items-sm-center mt-4">
              <p className="mb-0 text-center text-sm-start">
                Showing page {pagination.page} of {pagination.totalPages}
              </p>

              <ul className="pagination pagination-sm pagination-primary-soft mb-0">
                <li className={`page-item ${pagination.page === 1 ? "disabled" : ""}`}>
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
                  className={`page-item ${
                    pagination.page === pagination.totalPages ? "disabled" : ""
                  }`}
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