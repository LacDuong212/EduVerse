import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Badge, Button, Card, CardBody, CardFooter, CardHeader,
  Form, Modal, Spinner,
} from "react-bootstrap";
import { FaMoneyBillWave, FaSearch, FaTimes } from "react-icons/fa";
import PageMetaData from "@/components/PageMetaData";
import PaginationBar from "@/components/PaginationBar";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const AXIOS_CFG = { withCredentials: true };

const STATUS_VARIANT = { pending: "warning", paid: "success", approved: "success", rejected: "danger" };
const STATUS_LABEL = { pending: "Pending", paid: "Paid", approved: "Paid", rejected: "Rejected" };

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }) : "—";

const formatCurrency = (n) =>
  n == null ? "—" : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

function ActionModal({ payout, onClose, onSuccess }) {
  const [status, setStatus] = useState("paid");
  const [adminNote, setAdminNote] = useState("");
  const [noteError, setNoteError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (status === "rejected" && !adminNote.trim()) {
      setNoteError("A reason is required when rejecting a payout.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.patch(
        `${BACKEND_URL}/api/admin/payouts/${payout.id}`,
        { status, adminNote: adminNote.trim() || undefined },
        AXIOS_CFG
      );
      if (res.data.success) {
        toast.success(`Payout marked as ${status}.`);
        onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update payout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "1.05rem" }}>Process Payout Request</Modal.Title>
      </Modal.Header>
      <Modal.Body className="vstack gap-3 p-4">
        <div className="rounded-3 p-3" style={{ background: "rgba(var(--bs-body-emphasis-color-rgb,0,0,0),0.04)" }}>
          <div className="row g-2 small">
            <div className="col-6">
              <div className="text-body-secondary">Instructor</div>
              <div className="fw-semibold">{payout.instructor?.name}</div>
            </div>
            <div className="col-6">
              <div className="text-body-secondary">Amount</div>
              <div className="fw-semibold text-success">{formatCurrency(payout.amount)}</div>
            </div>
            <div className="col-6">
              <div className="text-body-secondary">Bank</div>
              <div>{payout.bankInfo?.bankName}</div>
            </div>
            <div className="col-6">
              <div className="text-body-secondary">Account No.</div>
              <div className="font-monospace">{payout.bankInfo?.accountNumber}</div>
            </div>
            <div className="col-12">
              <div className="text-body-secondary">Account Name</div>
              <div>{payout.bankInfo?.accountName}</div>
            </div>
            <div className="col-6">
              <div className="text-body-secondary">Period</div>
              <div>{payout.periodLabel || "—"}</div>
            </div>
            <div className="col-6">
              <div className="text-body-secondary">Submitted</div>
              <div>{formatDate(payout.createdAt)}</div>
            </div>
          </div>
        </div>

        <Form.Group>
          <Form.Label className="small fw-semibold">Action</Form.Label>
          <Form.Select value={status} onChange={(e) => { setStatus(e.target.value); setNoteError(""); }}>
            <option value="paid">Mark as Paid</option>
            <option value="rejected">Reject</option>
          </Form.Select>
        </Form.Group>

        <Form.Group>
          <Form.Label className="small fw-semibold">
            {status === "rejected" ? <>Reason <span className="text-danger">*</span></> : "Admin Note (optional)"}
          </Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder={status === "rejected" ? "Explain why this payout is being rejected..." : "Transfer reference, etc."}
            value={adminNote}
            onChange={(e) => { setAdminNote(e.target.value); if (e.target.value.trim()) setNoteError(""); }}
            maxLength={500}
            isInvalid={!!noteError}
          />
          <Form.Control.Feedback type="invalid">{noteError}</Form.Control.Feedback>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button variant="outline-secondary" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          variant={status === "rejected" ? "danger" : "primary"}
          size="sm"
          onClick={handleSubmit}
          disabled={loading}
          className="d-flex align-items-center gap-2"
        >
          {loading && <Spinner animation="border" size="sm" />}
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0 });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [activePayout, setActivePayout] = useState(null);

  const fetchPayouts = useCallback(async (p = 1, st = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: pageSize });
      if (st) params.set("status", st);
      const res = await axios.get(`${BACKEND_URL}/api/admin/payouts?${params}`, AXIOS_CFG);
      if (res.data.success) {
        setPayouts(res.data.result || []);
        setPagination(res.data.pagination || { totalPages: 1, totalItems: 0 });
      }
    } catch (err) {
      console.error("Failed to fetch payouts:", err);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchPayouts(page, appliedStatus);
  }, [page, pageSize, appliedStatus, fetchPayouts]);

  const handleApplyFilter = () => {
    setAppliedStatus(status);
    setPage(1);
  };

  const handleClearFilter = () => {
    setStatus("");
    setAppliedStatus("");
    setPage(1);
  };

  return (
    <>
      <PageMetaData title="Payouts" />
      <div className="page-title-box d-sm-flex align-items-start justify-content-between">
        <div>
          <h1 className="h3 mb-1 d-flex align-items-center gap-2">
            <FaMoneyBillWave className="text-success" size={22} /> Payout Requests
          </h1>
          <p className="page-subtitle mb-0">Review and process instructor payout requests</p>
        </div>
      </div>

      <Card className="bg-transparent">
        <CardHeader className="bg-transparent border-bottom px-0">
          <div className="row g-2 align-items-end">
            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold mb-1">Status</label>
              <Form.Select
                size="sm"
                className="bg-light"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </div>
            <div className="col-6 col-md-3 d-flex gap-2">
              <button className="btn btn-sm btn-primary mb-0" onClick={handleApplyFilter}>
                <FaSearch className="me-1" /> Apply
              </button>
              {appliedStatus && (
                <button className="btn btn-sm btn-outline-secondary" onClick={handleClearFilter}>
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardBody className="px-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" size="sm" className="text-body opacity-50" />
            </div>
          ) : payouts.length === 0 ? (
            <div className="text-center py-5 text-body-secondary">
              No payout requests found.
            </div>
          ) : (
            <div className="table-responsive border-0">
              <table className="table table-dark-gray align-middle p-4 mb-0 table-hover">
                <thead>
                  <tr>
                    <th className="border-0 rounded-start">Instructor</th>
                    <th className="border-0 text-center">Amount</th>
                    <th className="border-0 text-center">Bank / Account</th>
                    <th className="border-0 text-center">Status</th>
                    <th className="border-0 text-center">Submitted</th>
                    <th className="border-0 text-center">Processed</th>
                    <th className="border-0 text-center">Note</th>
                    <th className="border-0 text-center rounded-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="d-flex align-items-center position-relative">
                          <div className="avatar avatar-md">
                            {p.instructor?.avatar ? (
                              <img src={p.instructor.avatar} className="rounded-circle" alt="avatar" />
                            ) : (
                              <div className="avatar-img rounded-circle border-white border-3 shadow d-flex align-items-center justify-content-center bg-light text-dark fw-bold fs-4">
                                {p.instructor?.name?.[0]?.toUpperCase() || "?"}
                              </div>
                            )}
                          </div>
                          <div className="mb-0 ms-3">
                            <h6 className="mb-0">{p.instructor?.name || "—"}</h6>
                            <span>{p.instructor?.email || "—"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="fw-semibold text-info text-end">{formatCurrency(p.amount)}</td>
                      <td>
                        <div className="font-monospace">{p.bankInfo?.bankName}</div>
                        <div className="font-monospace">{p.bankInfo?.accountNumber}</div>
                        <div className="font-monospace">{p.bankInfo?.accountName}</div>
                      </td>
                      <td className="text-center">
                        <Badge bg={STATUS_VARIANT[p.status] || "secondary"}>
                          {STATUS_LABEL[p.status] || p.status}
                        </Badge>
                      </td>
                      <td>{formatDate(p.createdAt)}</td>
                      <td>{formatDate(p.processedAt)}</td>
                      <td style={{ maxWidth: 160 }}>
                        {p.adminNote || "—"}
                      </td>
                      <td className="text-center">
                        {p.status === "pending" ? (
                          <Button variant="primary-soft" size="sm" onClick={() => setActivePayout(p)}>
                            Process
                          </Button>
                        ) : (
                          <span>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>

        <CardFooter className="bg-transparent pt-0 px-0">
          <PaginationBar
            page={page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          />
        </CardFooter>
      </Card>

      {activePayout && (
        <ActionModal
          payout={activePayout}
          onClose={() => setActivePayout(null)}
          onSuccess={() => fetchPayouts(page, appliedStatus)}
        />
      )}
    </>
  );
}
