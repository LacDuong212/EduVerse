import PageMetaData from "@/components/PageMetaData";
import { Button, Card, CardBody, CardHeader, Form } from "react-bootstrap";
import { FaAngleLeft, FaAngleRight, FaSearch } from "react-icons/fa";
import { BsArrowRepeat, BsChevronDown, BsChevronRight, BsReceipt } from "react-icons/bs";
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
  const [expanded, setExpanded] = useState(false);

  const created = createdAt ? new Date(createdAt) : null;
  const createdText = created ? created.toLocaleString("vi-VN") : "N/A";
  const courseList = Array.isArray(courses) ? courses : [];
  const coursesCount = courseList.length;

  const firstItem = courseList[0] || null;
  const firstTitle = firstItem?.title || "Untitled Course";
  const firstThumb = firstItem?.thumbnail || firstItem?.image || "";

  return (
    <>
      <tr>
        <td>
          <div className="d-flex align-items-center">
            <button
              type="button"
              className="btn btn-link btn-sm p-0 me-2 text-body flex-shrink-0"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? "Hide courses" : "Show courses"}
              aria-expanded={expanded}
            >
              {expanded ? <BsChevronDown /> : <BsChevronRight />}
            </button>

            <div
              className="rounded overflow-hidden bg-light flex-shrink-0"
              style={{ width: 72, height: 52, cursor: "pointer" }}
              onClick={() => setExpanded((v) => !v)}
            >
              {firstThumb ? (
                <img
                  src={firstThumb}
                  alt={firstTitle}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : null}
            </div>

            <div className="flex-grow-1 ms-2 min-w-0">
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

              <div className="text-body small fw-bold">
                {coursesCount} course{coursesCount > 1 ? "s" : ""}
              </div>

              <div className="text-body small">{createdText}</div>
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

      {expanded && (
        <tr>
          <td colSpan={4} className="pt-0 border-top-0">
            <div className="bg-body-tertiary rounded-3 p-2 ms-4">
              {courseList.map((item, i) => {
                const title = item?.title || "Untitled Course";
                const thumb = item?.thumbnail || item?.image || "";
                const cid = item?.courseId;
                const price = item?.pricePaid;

                return (
                  <div
                    key={cid || i}
                    className={`d-flex align-items-center gap-2 py-2 ${
                      i < courseList.length - 1 ? "border-bottom" : ""
                    }`}
                  >
                    <div
                      className="rounded overflow-hidden bg-light flex-shrink-0"
                      style={{ width: 48, height: 34 }}
                    >
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : null}
                    </div>

                    <span
                      className={`small text-truncate ${cid ? "text-primary" : "text-body"}`}
                      style={{ cursor: cid ? "pointer" : "default" }}
                      onClick={() => cid && navigate(`/courses/${cid}`)}
                      title={title}
                    >
                      {title}
                    </span>

                    {price != null && (
                      <span className="ms-auto small fw-semibold text-body flex-shrink-0">
                        {formatCurrency(price)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const OrdersEmptyState = ({ isFiltering, onClear }) => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-5 px-3">
      <div
        className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 mb-3"
        style={{ width: 88, height: 88 }}
      >
        <BsReceipt className="text-primary" size={40} />
      </div>

      <h5 className="mb-2">
        {isFiltering ? "No orders match your filters" : "You haven’t placed any orders yet"}
      </h5>
      <p className="text-body mb-4">
        {isFiltering
          ? "Try adjusting or clearing your filters to see all your orders."
          : "Browse our courses and make your first purchase to get started."}
      </p>

      {isFiltering ? (
        <Button variant="outline-secondary" onClick={onClear}>
          Clear filters
        </Button>
      ) : (
        <Button variant="primary" onClick={() => navigate("/courses")}>
          Browse Courses
        </Button>
      )}
    </div>
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
        <CardHeader className="bg-transparent border-bottom">
          <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center">
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
                  className="position-absolute top-50 end-0 translate-middle-y me-3 text-body"
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
        </CardHeader>

        <CardBody>
          {!(orders.length === 0 && !filters.search && !filters.status) && (
            <OrderCounter stats={stats} loading={loading} />
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-3">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <OrdersEmptyState
              isFiltering={!!filters.search || !!filters.status}
              onClear={() => {
                setQ("");
                handleSearch("");
                handleStatus("");
              }}
            />
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
                  {orders.map((o) => (
                    <OrderRow key={o.orderId} {...o} />
                  ))}
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