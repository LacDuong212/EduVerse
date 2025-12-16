// src/app/pages/student/orders/OrderDetailPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import axios from "axios";

import { formatCurrency } from "@/utils/currency";
import { paymentLabel, statusLabel, statusVariant } from "@/utils/order";

import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCreditCard,
  FaReceipt,
  FaTag,
  FaInfoCircle,
} from "react-icons/fa";

const shortOrderCode = (id) => {
  const s = String(id || "");
  if (!s) return "";
  return s.slice(-4).toUpperCase();
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ error state
  const [error, setError] = useState(null);

  // ✅ cancel flow
  const [showCancel, setShowCancel] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const canLearn = order?.status === "completed";
  const canCancel = order?.status === "pending";

  // ---- Fetch order detail ----
  useEffect(() => {
    if (!id || !backendUrl) return;

    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`${backendUrl}/api/orders/${id}`, {
          withCredentials: true,
        });
        if (data?.success) setOrder(data.order);
        else {
          setOrder(null);
          setError(data?.message || "Failed to load order");
        }
      } catch (err) {
        setOrder(null);
        const msg =
          err?.response?.data?.message ||
          (err?.response?.status === 403
            ? "Unauthorized access to this order."
            : err?.response?.status === 404
            ? "Order not found."
            : "Something went wrong while loading order.");
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, backendUrl]);

  const createdAt = useMemo(() => {
    if (!order?.createdAt) return "N/A";
    return new Date(order.createdAt).toLocaleString("vi-VN");
  }, [order?.createdAt]);

  const courseRows = useMemo(() => {
    return (order?.courses || []).map((item, idx) => {
      const course = item.course || {};
      return {
        key: item._id || idx,
        index: idx + 1,
        title: course.title || course.name || "Untitled Course",
        thumbnail: course.thumbnail || course.image || "",
        courseId: course._id,
        pricePaid: item.pricePaid || 0,
      };
    });
  }, [order]);

  // ✅ cancel order handler
  const handleCancelOrder = async () => {
    if (!backendUrl || !order?._id) return;
    setCancelLoading(true);

    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/orders/${order._id}/update`,
        { status: "cancelled" },
        { withCredentials: true }
      );

      if (data?.success) {
        setOrder(data.order); // update UI immediately
        setShowCancel(false);
      } else {
        setError(data?.message || "Cancel order failed");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Cancel order failed. Please try again.";
      setError(msg);
    } finally {
      setCancelLoading(false);
    }
  };

  // ===== Loading =====
  if (loading) {
    return (
      <div className="py-5 text-center">
        <Spinner animation="border" />
      </div>
    );
  }

  // ✅ Error UI (no infinite spinner)
  if (error && !order) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h4 className="mb-0">Order detail</h4>
            <Button variant="outline-secondary" onClick={() => navigate(-1)}>
              <FaArrowLeft className="me-2" />
              Back
            </Button>
          </div>

          <Alert variant="danger" className="mb-0">
            {error}
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  if (!order) return null;

  const orderCode = shortOrderCode(order._id);

  return (
    <div>
      {/* ===== Top bar ===== */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h4 className="mb-0">Order detail</h4>
            <Badge bg={statusVariant(order.status)}>
              {statusLabel(order.status)}
            </Badge>
          </div>

          {/* ✅ stronger contrast */}
          <div className="text-body small mt-1" title={order._id}>
            Order <span className="fw-semibold">#{orderCode}</span>
            <span className="ms-2 text-muted">·</span>
            <span className="ms-2 text-muted">
              ID: {String(order._id).slice(0, 8)}…
            </span>
          </div>
        </div>

        <div className="d-flex gap-2">
          {/* Cancel order (pending only) */}
          {canCancel && (
            <Button
              variant="outline-danger"
              onClick={() => setShowCancel(true)}
              disabled={cancelLoading}
            >
              Cancel order
            </Button>
          )}

          <Button variant="outline-secondary" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-2" />
            Back
          </Button>
        </div>
      </div>

      {/* inline error (if any) */}
      {error ? <Alert variant="warning">{error}</Alert> : null}

      {/* ===== Information ===== */}
      <Card className="border-0 shadow-sm mb-3">
        <Card.Body>
          <div className="d-flex align-items-center gap-2 mb-3">
            <FaInfoCircle className="text-muted" />
            <h5 className="mb-0">Information</h5>
          </div>

          <Row className="g-3">
            <Col md={6}>
              <div className="d-flex align-items-center gap-2 mb-1">
                <FaCalendarAlt className="text-muted" />
                <span className="fw-semibold text-body">Created at</span>
              </div>
              <div className="text-body">{createdAt}</div>
            </Col>

            <Col md={6}>
              <div className="d-flex align-items-center gap-2 mb-1">
                <FaCreditCard className="text-muted" />
                <span className="fw-semibold text-body">Payment</span>
              </div>

              <div>
                <span className="fw-semibold text-body">
                  {paymentLabel(order.paymentMethod)}
                </span>
                {!canLearn && (
                  <span className="ms-2 text-muted small">
                    · Access locked until completed
                  </span>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ===== Courses ===== */}
      <Card className="border-0 shadow-sm mb-3">
        <Card.Body>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="mb-0">Courses</h5>
            <div className="text-muted small">
              {courseRows.length} course{courseRows.length > 1 ? "s" : ""}
            </div>
          </div>

          <Table responsive className="align-middle mb-0">
            <thead>
              <tr className="text-muted small">
                <th style={{ width: 60 }}>#</th>
                <th>Course</th>
                <th className="text-end" style={{ width: 160 }}>
                  Price paid
                </th>
                <th className="text-end" style={{ width: 180 }}>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {courseRows.map((r) => (
                <tr key={r.key}>
                  <td className="text-muted">{r.index}</td>

                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-3 overflow-hidden bg-light flex-shrink-0"
                        style={{ width: 56, height: 42 }}
                      >
                        {r.thumbnail ? (
                          <img
                            src={r.thumbnail}
                            alt={r.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : null}
                      </div>

                      <div>
                        <div className="fw-semibold text-body">{r.title}</div>
                        {!canLearn ? (
                          <div className="text-muted small">
                            Access locked until order is completed
                          </div>
                        ) : (
                          <div className="text-muted small">Ready to learn</div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="text-end fw-semibold text-body">
                    {formatCurrency(r.pricePaid)}
                  </td>

                  <td className="text-end">
                    {r.courseId ? (
                      canLearn ? (
                        <Button
                          as={Link}
                          to={`/learning/${r.courseId}`}
                          size="sm"
                          variant="outline-primary"
                        >
                          Go to learning
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          disabled
                          title="Order must be completed to access learning"
                        >
                          Locked
                        </Button>
                      )
                    ) : (
                      <Button size="sm" variant="outline-secondary" disabled>
                        N/A
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* ===== Summary ===== */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex align-items-center gap-2 mb-3">
            <FaReceipt className="text-muted" />
            <h5 className="mb-0">Summary</h5>
          </div>

          <div className="ms-auto" style={{ maxWidth: 400 }}>
            <div className="d-flex justify-content-between text-body">
              <span>Sub total</span>
              <span className="fw-semibold text-body">
                {formatCurrency(order.subTotal)}
              </span>
            </div>

            <div className="d-flex justify-content-between text-body mt-1">
              <span className="d-flex align-items-center gap-2">
                <FaTag />
                Discount
              </span>
              <span className="fw-semibold text-body">
                {formatCurrency(order.discountAmount)}
              </span>
            </div>

            <hr className="my-2" />

            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-semibold fs-5 text-body">Total</span>
              <span className="fw-bold fs-5 text-body">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Cancel confirm modal */}
      <Modal show={showCancel} onHide={() => setShowCancel(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancel this order?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This action cannot be undone. You can only cancel orders that are still{" "}
          <b>Pending</b>.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowCancel(false)}
            disabled={cancelLoading}
          >
            Close
          </Button>
          <Button
            variant="danger"
            onClick={handleCancelOrder}
            disabled={cancelLoading}
          >
            {cancelLoading ? "Cancelling..." : "Yes, cancel"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
