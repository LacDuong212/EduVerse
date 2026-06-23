import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Badge, Card, CardBody, CardFooter, CardHeader,
  Col, Form, Row, Spinner,
} from "react-bootstrap";
import { FaClipboardList, FaSearch, FaTimes, FaChevronDown, FaChevronRight } from "react-icons/fa";
import PageMetaData from "@/components/PageMetaData";
import PaginationBar from "@/components/PaginationBar";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const AXIOS_CFG = { withCredentials: true };

const ACTION_LABELS = {
  LOGIN_SUCCESS:        "Login",
  LOGIN_FAILED:         "Login Failed",
  LOGOUT:               "Logout",
  COURSE_APPROVE:       "Approved",
  COURSE_REJECT:        "Rejected",
  COURSE_BLOCK:         "Blocked",
  COURSE_UNBLOCK:       "Unblocked",
  COURSE_DELETE:        "Deleted",
  COURSE_RESTORE:       "Restored",
  INSTRUCTOR_APPROVE:   "Approved",
  INSTRUCTOR_REJECT:    "Rejected",
  INSTRUCTOR_BLOCK:     "Blocked",
  INSTRUCTOR_UNBLOCK:   "Unblocked",
  STUDENT_BLOCK:        "Blocked",
  STUDENT_UNBLOCK:      "Unblocked",
  STUDENT_DELETE:       "Deleted",
  PAYOUT_MARK_PAID:     "Mark Paid",
  PAYOUT_REJECT:        "Rejected",
  COUPON_CREATE:        "Created",
  COUPON_UPDATE_STATUS: "Changed",
  COUPON_DELETE:        "Deleted",
  CATEGORY_CREATE:      "Created",
  CATEGORY_UPDATE:      "Changed",
  CATEGORY_DELETE:      "Deleted",
  ADMIN_CHANGE_PASSWORD:"Changed",
};

const ACTION_VARIANT = {
  LOGIN_SUCCESS:        "success",
  LOGIN_FAILED:         "danger",
  LOGOUT:               "secondary",
  COURSE_APPROVE:       "success",
  COURSE_REJECT:        "danger",
  COURSE_BLOCK:         "warning",
  COURSE_UNBLOCK:       "info",
  COURSE_DELETE:        "danger",
  COURSE_RESTORE:       "success",
  INSTRUCTOR_APPROVE:   "success",
  INSTRUCTOR_REJECT:    "danger",
  INSTRUCTOR_BLOCK:     "warning",
  INSTRUCTOR_UNBLOCK:   "info",
  STUDENT_BLOCK:        "warning",
  STUDENT_UNBLOCK:      "info",
  STUDENT_DELETE:       "danger",
  PAYOUT_MARK_PAID:     "success",
  PAYOUT_REJECT:        "danger",
  COUPON_CREATE:        "primary",
  COUPON_UPDATE_STATUS: "info",
  COUPON_DELETE:        "danger",
  CATEGORY_CREATE:      "primary",
  CATEGORY_UPDATE:      "info",
  CATEGORY_DELETE:      "danger",
  ADMIN_CHANGE_PASSWORD:"secondary",
};

const ACTION_GROUPS = [
  { label: "Auth",       actions: ["LOGIN_SUCCESS", "LOGIN_FAILED", "LOGOUT"] },
  { label: "Course",     actions: ["COURSE_APPROVE", "COURSE_REJECT", "COURSE_BLOCK", "COURSE_UNBLOCK", "COURSE_DELETE", "COURSE_RESTORE"] },
  { label: "Instructor", actions: ["INSTRUCTOR_APPROVE", "INSTRUCTOR_REJECT", "INSTRUCTOR_BLOCK", "INSTRUCTOR_UNBLOCK"] },
  { label: "Student",    actions: ["STUDENT_BLOCK", "STUDENT_UNBLOCK", "STUDENT_DELETE"] },
  { label: "Payout",     actions: ["PAYOUT_MARK_PAID", "PAYOUT_REJECT"] },
  { label: "Coupon",     actions: ["COUPON_CREATE", "COUPON_UPDATE_STATUS", "COUPON_DELETE"] },
  { label: "Category",   actions: ["CATEGORY_CREATE", "CATEGORY_UPDATE", "CATEGORY_DELETE"] },
  { label: "Admin",      actions: ["ADMIN_CHANGE_PASSWORD"] },
];

const ENTITY_OPTIONS = [
  { value: "AUTH",       label: "Auth" },
  { value: "COURSE",     label: "Course" },
  { value: "INSTRUCTOR", label: "Instructor" },
  { value: "STUDENT",    label: "Student" },
  { value: "PAYOUT",     label: "Payout" },
  { value: "COUPON",     label: "Coupon" },
  { value: "CATEGORY",   label: "Category" },
  { value: "ADMIN",      label: "Admin" },
];

const formatDatetime = (d) =>
  d
    ? new Date(d).toLocaleString("en-US", {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      })
    : "—";

function DiffPanel({ before, after }) {
  if (before == null && after == null) return <span className="text-body-secondary small">No changes recorded</span>;
  return (
    <Row className="g-3 mt-0">
      <Col xs={12} md={6}>
        <div className="fw-semibold small mb-1 text-body-secondary">Before</div>
        <pre
          className="rounded-3 p-3 small mb-0"
          style={{ background: "rgba(var(--bs-danger-rgb),0.06)", whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: "0.75rem" }}
        >
          {before != null ? JSON.stringify(before, null, 2) : "—"}
        </pre>
      </Col>
      <Col xs={12} md={6}>
        <div className="fw-semibold small mb-1 text-body-secondary">After</div>
        <pre
          className="rounded-3 p-3 small mb-0"
          style={{ background: "rgba(var(--bs-success-rgb),0.06)", whiteSpace: "pre-wrap", wordBreak: "break-all", fontSize: "0.75rem" }}
        >
          {after != null ? JSON.stringify(after, null, 2) : "—"}
        </pre>
      </Col>
    </Row>
  );
}

function LogRow({ log }) {
  const [expanded, setExpanded] = useState(false);
  const hasDiff = log.before != null || log.after != null;

  return (
    <>
      <tr>
        <td style={{ width: 28, paddingRight: 0 }}>
          {hasDiff && (
            <button
              className="btn btn-link p-0 text-body-secondary"
              onClick={() => setExpanded((v) => !v)}
              title={expanded ? "Collapse" : "Expand changes"}
            >
              {expanded ? <FaChevronDown /> : <FaChevronRight />}
            </button>
          )}
        </td>
        <td>
          <Badge bg={ACTION_VARIANT[log.action] || "secondary"}>
            {ACTION_LABELS[log.action] || log.action}
          </Badge>
        </td>
        <td>
          <div>{log.entityLabel || "—"}</div>
          <div className="text-body-secondary">{log.entityType}</div>
        </td>
        <td className="text-body-secondary" style={{ maxWidth: 200 }}>
          {log.reason || "—"}
        </td>
        <td>
          <div className="fw-semibold">{log.adminName}</div>
          <div className="font-monospace text-body-secondary">{log.ipAddress || "—"}</div>
        </td>
        <td>{log.adminEmail || "—"}</td>
        <td className="text-body-secondary" style={{ whiteSpace: "nowrap" }}>
          {formatDatetime(log.createdAt)}
        </td>
      </tr>
      {expanded && hasDiff && (
        <tr>
          <td />
          <td colSpan={7} className="py-2 px-3">
            <DiffPanel before={log.before} after={log.after} />
          </td>
        </tr>
      )}
    </>
  );
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0 });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({ search: "", entityType: "", action: "", from: "", to: "" });
  const [applied, setApplied] = useState({ search: "", entityType: "", action: "", from: "", to: "" });

  const fetchLogs = useCallback(async (p = 1, f = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: pageSize });
      if (f.search)     params.set("search", f.search.trim());
      if (f.entityType) params.set("entityType", f.entityType);
      if (f.action)     params.set("action", f.action);
      if (f.from)       params.set("from", f.from);
      if (f.to)         params.set("to", f.to);
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
    const empty = { search: "", entityType: "", action: "", from: "", to: "" };
    setFilters(empty);
    setApplied(empty);
    setPage(1);
  };

  const hasFilter = applied.search || applied.entityType || applied.action || applied.from || applied.to;

  // When entity type filter changes, reset action filter since the group changes
  const handleEntityChange = (val) => {
    setFilters((f) => ({ ...f, entityType: val, action: "" }));
  };

  const actionOptionsForEntity = filters.entityType
    ? ACTION_GROUPS.find((g) => g.label.toUpperCase() === filters.entityType)?.actions || []
    : ACTION_GROUPS.flatMap((g) => g.actions);

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

      <Card className="bg-transparent">
        <CardHeader className="bg-transparent border-bottom px-0">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold mb-1">Search</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-body"><FaSearch size={11} className="text-body-secondary" /></span>
                <Form.Control
                  size="sm"
                  className="bg-body"
                  placeholder="Admin name, email, or impact..."
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleApply()}
                />
              </div>
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold mb-1">Entity</label>
              <Form.Select
                size="sm"
                className="bg-body"
                value={filters.entityType}
                onChange={(e) => handleEntityChange(e.target.value)}
              >
                <option value="">All entities</option>
                {ENTITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Form.Select>
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold mb-1">Action</label>
              <Form.Select
                size="sm"
                className="bg-body"
                value={filters.action}
                onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value }))}
              >
                <option value="">All actions</option>
                {actionOptionsForEntity.map((a) => (
                  <option key={a} value={a}>{ACTION_LABELS[a] || a}</option>
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

        <CardBody className="px-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" size="sm" className="text-body opacity-50" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-5 text-body-secondary">
              No audit logs found.
            </div>
          ) : (
            <div className="table-responsive border-0">
              <table className="table table-dark-gray align-middle p-4 mb-0 table-hover">
                <thead>
                  <tr>
                    <th className="border-0 rounded-start" style={{ width: 28 }} />
                    <th className="border-0">Action</th>
                    <th className="border-0">Impact</th>
                    <th className="border-0">Reason</th>
                    <th className="border-0">Admin</th>
                    <th className="border-0">Email</th>
                    <th className="border-0 rounded-end">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <LogRow key={log._id} log={log} />
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
    </>
  );
}
