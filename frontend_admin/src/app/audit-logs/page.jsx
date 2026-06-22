import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Badge, Button, Card, CardBody, CardHeader,
  Col, Form, Modal, Row, Spinner, Table,
} from "react-bootstrap";
import { FaClipboardList, FaSearch, FaTimes } from "react-icons/fa";
import PageMetaData from "@/components/PageMetaData";
import PaginationBar from "@/components/PaginationBar";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const AXIOS_CFG = { withCredentials: true };

const ACTION_LABELS = {
  LOGIN_SUCCESS: "Login Success",
  LOGIN_FAILED: "Login Failed",
  LOGOUT: "Logout",
  COURSE_APPROVE: "Approve",
  COURSE_REJECT: "Reject",
  COURSE_BLOCK: "Block",
  COURSE_UNBLOCK: "Unblock",
  COURSE_DELETE: "Delete",
  COURSE_RESTORE: "Restore",
  INSTRUCTOR_APPROVE: "Approve",
  INSTRUCTOR_REJECT: "Reject",
  INSTRUCTOR_BLOCK: "Block",
  INSTRUCTOR_UNBLOCK: "Unblock",
  PAYOUT_MARK_PAID: "Mark as Paid",
  PAYOUT_REJECT: "Reject",
  COUPON_CREATE: "Create",
  COUPON_UPDATE_STATUS: "Update Status",
  COUPON_DELETE: "Delete",
  CATEGORY_CREATE: "Create",
  CATEGORY_UPDATE: "Update",
  CATEGORY_DELETE: "Delete",
};

const ACTION_GROUPS = [
  { label: "Auth", actions: ["LOGIN_SUCCESS", "LOGIN_FAILED", "LOGOUT"] },
  { label: "Course", actions: ["COURSE_APPROVE", "COURSE_REJECT", "COURSE_BLOCK", "COURSE_UNBLOCK", "COURSE_DELETE", "COURSE_RESTORE"] },
  { label: "Instructor", actions: ["INSTRUCTOR_APPROVE", "INSTRUCTOR_REJECT", "INSTRUCTOR_BLOCK", "INSTRUCTOR_UNBLOCK"] },
  { label: "Payout", actions: ["PAYOUT_MARK_PAID", "PAYOUT_REJECT"] },
  { label: "Coupon", actions: ["COUPON_CREATE", "COUPON_UPDATE_STATUS", "COUPON_DELETE"] },
  { label: "Category", actions: ["CATEGORY_CREATE", "CATEGORY_UPDATE", "CATEGORY_DELETE"] },
];

const ACTION_VARIANT = {
  LOGIN_SUCCESS: "success",
  LOGIN_FAILED: "danger",
  LOGOUT: "secondary",
  COURSE_APPROVE: "success",
  COURSE_REJECT: "danger",
  COURSE_BLOCK: "warning",
  COURSE_UNBLOCK: "info",
  COURSE_DELETE: "danger",
  COURSE_RESTORE: "success",
  INSTRUCTOR_APPROVE: "success",
  INSTRUCTOR_REJECT: "danger",
  INSTRUCTOR_BLOCK: "warning",
  INSTRUCTOR_UNBLOCK: "info",
  PAYOUT_MARK_PAID: "success",
  PAYOUT_REJECT: "danger",
  COUPON_CREATE: "primary",
  COUPON_UPDATE_STATUS: "info",
  COUPON_DELETE: "danger",
  CATEGORY_CREATE: "primary",
  CATEGORY_UPDATE: "info",
  CATEGORY_DELETE: "danger",
};

const ENTITY_OPTIONS = [
  { value: "AUTH", label: "Auth" },
  { value: "COURSE", label: "Course" },
  { value: "INSTRUCTOR", label: "Instructor" },
  { value: "PAYOUT", label: "Payout" },
  { value: "COUPON", label: "Coupon" },
  { value: "CATEGORY", label: "Category" },
];

const formatDatetime = (d) =>
  d
    ? new Date(d).toLocaleString("en-US", {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      })
    : "—";

function DiffModal({ log, onClose }) {
  const hasDiff = log.before != null || log.after != null;
  return (
    <Modal show onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: "1rem" }}>
          <Badge bg={ACTION_VARIANT[log.action] || "secondary"} className="me-2">
            {ACTION_LABELS[log.action] || log.action}
          </Badge>
          {log.entityLabel || log.entityId || "—"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 vstack gap-3">
        <div className="row g-2 small">
          <div className="col-6">
            <span className="text-body-secondary">Admin</span>
            <div className="fw-semibold">{log.adminName}</div>
          </div>
          <div className="col-6">
            <span className="text-body-secondary">Time</span>
            <div>{formatDatetime(log.createdAt)}</div>
          </div>
          <div className="col-6">
            <span className="text-body-secondary">Entity Type</span>
            <div>{log.entityType}</div>
          </div>
          <div className="col-6">
            <span className="text-body-secondary">IP Address</span>
            <div className="font-monospace">{log.ipAddress || "—"}</div>
          </div>
          <div className="col-12">
            <span className="text-body-secondary">Result</span>
            <div>
              {log.success ? (
                <Badge bg="success">Success</Badge>
              ) : (
                <span>
                  <Badge bg="danger" className="me-2">Failed</Badge>
                  <span className="text-body-secondary small">{log.failReason || ""}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {hasDiff && (
          <Row className="g-3">
            <Col>
              <div className="fw-semibold small mb-1 text-body-secondary">Before</div>
              <pre
                className="rounded-3 p-3 small mb-0"
                style={{ background: "rgba(var(--bs-body-emphasis-color-rgb,0,0,0),0.04)", whiteSpace: "pre-wrap", wordBreak: "break-all" }}
              >
                {log.before != null ? JSON.stringify(log.before, null, 2) : "—"}
              </pre>
            </Col>
            <Col>
              <div className="fw-semibold small mb-1 text-body-secondary">After</div>
              <pre
                className="rounded-3 p-3 small mb-0"
                style={{ background: "rgba(var(--bs-body-emphasis-color-rgb,0,0,0),0.04)", whiteSpace: "pre-wrap", wordBreak: "break-all" }}
              >
                {log.after != null ? JSON.stringify(log.after, null, 2) : "—"}
              </pre>
            </Col>
          </Row>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button variant="outline-secondary" size="sm" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0 });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [activeLog, setActiveLog] = useState(null);

  const [filters, setFilters] = useState({ entityType: "", from: "", to: "" });
  const [applied, setApplied] = useState({ entityType: "", from: "", to: "" });

  const fetchLogs = useCallback(async (p = 1, f = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: pageSize });
      if (f.entityType) params.set("entityType", f.entityType);
      if (f.from) params.set("from", f.from);
      if (f.to) params.set("to", f.to);
      const res = await axios.get(`${BACKEND_URL}/api/admin/audit-logs?${params}`, AXIOS_CFG);
      if (res.data.success) {
        setLogs(res.data.result || []);
        setPagination(res.data.pagination || { totalPages: 1, totalItems: 0 });
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchLogs(page, applied);
  }, [page, pageSize, applied, fetchLogs]);

  const handleApply = () => {
    setApplied({ ...filters });
    setPage(1);
  };

  const handleClear = () => {
    const empty = { entityType: "", from: "", to: "" };
    setFilters(empty);
    setApplied(empty);
    setPage(1);
  };

  const hasFilter = applied.entityType || applied.from || applied.to;

  return (
    <>
      <PageMetaData title="Audit Logs" />
      <div className="page-title-box d-sm-flex align-items-start justify-content-between">
        <div>
          <h1 className="h3 mb-1 d-flex align-items-center gap-2">
            <FaClipboardList className="text-primary" size={22} /> Audit Logs
          </h1>
          <p className="page-subtitle mb-0">Track every admin action across the system</p>
        </div>
      </div>

      <Card className="bg-transparent border">
        <CardHeader className="bg-light border-bottom">
          <div className="row g-2 align-items-end">
            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold mb-1">Entity</label>
              <Form.Select
                size="sm"
                className="bg-body"
                value={filters.entityType}
                onChange={(e) => setFilters((f) => ({ ...f, entityType: e.target.value }))}
              >
                <option value="">All</option>
                {ENTITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Form.Select>
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold mb-1">From</label>
              <Form.Control
                size="sm"
                type="date"
                className="bg-body"
                value={filters.from}
                onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
              />
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold mb-1">To</label>
              <Form.Control
                size="sm"
                type="date"
                className="bg-body"
                value={filters.to}
                onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
              />
            </div>
            <div className="col-12 col-md-3 d-flex gap-2">
              <button className="btn btn-sm btn-primary" onClick={handleApply}>
                <FaSearch className="me-1" /> Apply
              </button>
              {hasFilter && (
                <button className="btn btn-sm btn-outline-secondary" onClick={handleClear}>
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardBody className="pb-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" size="sm" className="text-body opacity-50" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-5 text-body-secondary">
              No audit logs found.
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0 table-dark-gray">
                <thead>
                  <tr>
                    <th className="border-0">Admin</th>
                    <th className="border-0">Action</th>
                    <th className="border-0">Old Data</th>
                    <th className="border-0">New Data</th>
                    <th className="border-0">Timestamp</th>
                    <th className="border-0">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td className="small">
                        <div className="fw-semibold">{log.adminName}</div>
                        <div className="text-body-secondary font-monospace" style={{ fontSize: "0.68rem" }}>{log.ipAddress || "—"}</div>
                      </td>
                      <td>
                        <Badge bg={ACTION_VARIANT[log.action] || "secondary"} style={{ fontSize: "0.7rem" }}>
                          {ACTION_LABELS[log.action] || log.action}
                        </Badge>
                        <div className="text-body-secondary small mt-1" style={{ fontSize: "0.72rem" }}>
                          {log.entityLabel || log.entityId || "—"}
                        </div>
                      </td>
                      <td style={{ maxWidth: 180 }}>
                        {log.before != null ? (
                          <pre className="mb-0 small rounded-2 px-2 py-1" style={{ background: "rgba(var(--bs-danger-rgb),0.06)", fontSize: "0.68rem", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                            {JSON.stringify(log.before, null, 2)}
                          </pre>
                        ) : (
                          <span className="text-body-secondary small">—</span>
                        )}
                      </td>
                      <td style={{ maxWidth: 180 }}>
                        {log.after != null ? (
                          <pre className="mb-0 small rounded-2 px-2 py-1" style={{ background: "rgba(var(--bs-success-rgb),0.06)", fontSize: "0.68rem", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                            {JSON.stringify(log.after, null, 2)}
                          </pre>
                        ) : (
                          <span className="text-body-secondary small">—</span>
                        )}
                      </td>
                      <td className="small text-body-secondary" style={{ whiteSpace: "nowrap" }}>
                        {formatDatetime(log.createdAt)}
                      </td>
                      <td>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          style={{ fontSize: "0.72rem", padding: "2px 8px" }}
                          onClick={() => setActiveLog(log)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </CardBody>

        <CardHeader className="bg-transparent">
          <PaginationBar
            page={page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          />
        </CardHeader>
      </Card>

      {activeLog && (
        <DiffModal log={activeLog} onClose={() => setActiveLog(null)} />
      )}
    </>
  );
}
