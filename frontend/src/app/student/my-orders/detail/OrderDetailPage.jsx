import { useMemo, useState } from "react";
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

import { formatCurrency } from "@/utils/currency";
import { paymentLabel, statusLabel, statusVariant } from "@/utils/order";
import useOrderDetail from "./useOrderDetail";

import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCreditCard,
  FaReceipt,
  FaTag,
  FaInfoCircle,
} from "react-icons/fa";
import axios from "axios";

const shortOrderCode = (id) => {
  const s = String(id || "");
  return s ? s.slice(-4).toUpperCase() : "";
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const { order, loading, error, refetch } = useOrderDetail(id);

  const [showCancel, setShowCancel] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [payLoading, setPayLoading] = useState(false);

  const canLearn = order?.status === "completed";
  const canCancel = order?.status === "pending";

  const canPayAgain =
    order?.status === "pending" &&
    order?.paymentMethod !== "free" &&
    order?.expiresAt &&
    new Date(order.expiresAt) > new Date();

  const createdAt = useMemo(() => {
    if (!order?.createdAt) return "N/A";
    return new Date(order.createdAt).toLocaleString("vi-VN");
  }, [order?.createdAt]);

  const courseRows = useMemo(() => {
    return (order?.courses || []).map((item, idx) => {
      const course = item.course || {};
      return {
        key: `${course.courseId || idx}-${idx}`,
        index: idx + 1,
        title: course.title || "Untitled Course",
        thumbnail: course.thumbnail || course.image || "",
        courseId: course.courseId,
        pricePaid: item.pricePaid || 0,
      };
    });
  }, [order]);

  const handleCancelOrder = async () => {
    if (!backendUrl || !order?.orderId) return;
    setCancelLoading(true);
    setActionError(null);

    try {
      const { data } = await axios.patch(
        `${backendUrl}/api/orders/${order.orderId}/cancel`,
        {},
        { withCredentials: true }
      );

      if (data?.success) {
        await refetch();
        setShowCancel(false);
      } else {
        setActionError(data?.message || "Cancel order failed");
      }
    } catch (err) {
      setActionError(
        err?.response?.data?.message || "Cancel order failed. Please try again."
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const handlePayAgain = async () => {
    if (!canPayAgain) {
      setActionError("This order can no longer be paid.");
      return;
    }

    if (!backendUrl || !order?.orderId || !order?.paymentMethod) return;

    setPayLoading(true);
    setActionError(null);

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/payments`,
        {
          orderId: order.orderId,
          paymentMethod: order.paymentMethod,
        },
        { withCredentials: true }
      );

      if (data?.success) {
        const result = data?.result;

        if (result?.payUrl) {
          window.location.href = result.payUrl;
        } else {
          setActionError("Payment URL was not returned.");
        }
      } else {
        setActionError(data?.message || "Could not create payment URL.");
      }
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
        "Could not resume payment. Please try again."
      );
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-5 text-center">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error && !order) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h4 className="mb-0">Order detail</h4>
            <Button
              variant="outline-secondary"
              onClick={() => navigate(-1)}
              disabled={payLoading}
            >
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

  const orderCode = shortOrderCode(order.orderId);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h4 className="mb-0">Order detail</h4>
            <Badge bg={statusVariant(order.status)}>
              {statusLabel(order.status)}
            </Badge>
          </div>

          <div className="text-body small mt-1" title={order.orderId}>
            Order <span className="fw-semibold">#{orderCode}</span>
            <span className="ms-2 text-muted">·</span>
            <span className="ms-2 text-muted">
              ID: {String(order.orderId).slice(0, 8)}…
            </span>
          </div>
        </div>

        <div className="d-flex gap-2">
          {canPayAgain && (
            <Button
              variant="success"
              onClick={handlePayAgain}
              disabled={payLoading}
            >
              {payLoading ? "Redirecting..." : "Pay Again"}
            </Button>
          )}

          {canCancel && (
            <Button
              variant="outline-danger"
              onClick={() => setShowCancel(true)}
              disabled={cancelLoading || payLoading}
            >
              Cancel order
            </Button>
          )}

          <Button
            variant="outline-secondary"
            onClick={() => navigate(-1)}
            disabled={payLoading}
          >
            <FaArrowLeft className="me-2" />
            Back
          </Button>
        </div>
      </div>

      {error ? <Alert variant="warning">{error}</Alert> : null}
      {actionError ? <Alert variant="warning">{actionError}</Alert> : null}
      {order?.status === "pending" &&
        order?.expiresAt &&
        new Date(order.expiresAt) <= new Date() && (
          <Alert variant="warning">
            This order has expired. Please cancel it and create a new order.
          </Alert>
        )}

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
            disabled={cancelLoading || payLoading}
          >
            Close
          </Button>
          <Button
            variant="danger"
            onClick={handleCancelOrder}
            disabled={cancelLoading || payLoading}
          >
            {cancelLoading ? "Cancelling..." : "Yes, cancel"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}