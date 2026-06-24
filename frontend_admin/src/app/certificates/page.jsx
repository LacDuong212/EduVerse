import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Card, CardBody, CardFooter, CardHeader, Form, Spinner } from "react-bootstrap";
import { FaCertificate, FaSearch, FaTimes } from "react-icons/fa";
import PageMetaData from "@/components/PageMetaData";
import PaginationBar from "@/components/PaginationBar";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const AXIOS_CFG = { withCredentials: true };

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export default function AdminCertificatesPage() {
  const [certs, setCerts] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0 });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);

  // filter inputs (draft) vs applied
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [applied, setApplied] = useState({ q: "", from: "", to: "" });

  const fetchCertificates = useCallback(async (p, f) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: pageSize });
      if (f.q) params.set("q", f.q);
      if (f.from) params.set("from", f.from);
      if (f.to) params.set("to", f.to);
      const res = await axios.get(
        `${BACKEND_URL}/api/admin/certificates?${params}`,
        AXIOS_CFG
      );
      if (res.data.success) {
        setCerts(res.data.result || []);
        setPagination(res.data.pagination || { totalPages: 1, totalItems: 0 });
      }
    } catch (err) {
      console.error("Failed to fetch certificates:", err);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchCertificates(page, applied);
  }, [page, pageSize, applied, fetchCertificates]);

  const handleApply = () => {
    setApplied({ q: q.trim(), from, to });
    setPage(1);
  };

  const handleClear = () => {
    setQ("");
    setFrom("");
    setTo("");
    setApplied({ q: "", from: "", to: "" });
    setPage(1);
  };

  const hasFilter = applied.q || applied.from || applied.to;

  return (
    <>
      <PageMetaData title="Certificates" />
      <div className="page-title-box d-sm-flex align-items-start justify-content-between">
        <div>
          <h1 className="h3 mb-1 d-flex align-items-center gap-2">
            <FaCertificate className="text-success" size={22} /> Certificates
          </h1>
          <p className="page-subtitle mb-0">All certificates issued to students</p>
        </div>
      </div>

      <Card className="bg-transparent">
        <CardHeader className="bg-transparent border-bottom px-0">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold mb-1">Search</label>
              <Form.Control
                size="sm"
                className="bg-light"
                placeholder="Student name, email, or certificate ID"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApply()}
              />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold mb-1">Issued from</label>
              <Form.Control
                size="sm"
                type="date"
                className="bg-light"
                value={from}
                max={to || undefined}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold mb-1">Issued to</label>
              <Form.Control
                size="sm"
                type="date"
                className="bg-light"
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-2 d-flex gap-2">
              <button className="btn btn-sm btn-primary mb-0" onClick={handleApply}>
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
          ) : certs.length === 0 ? (
            <div className="text-center py-5 text-body-secondary">
              {hasFilter ? "No certificates match your filters." : "No certificates issued yet."}
            </div>
          ) : (
            <div className="table-responsive border-0">
              <table className="table table-dark-gray align-middle p-4 mb-0 table-hover">
                <thead>
                  <tr>
                    <th className="border-0 rounded-start">Student</th>
                    <th className="border-0">Email</th>
                    <th className="border-0">Course</th>
                    <th className="border-0">Instructor</th>
                    <th className="border-0 text-center">Issued</th>
                    <th className="border-0 text-center rounded-end">Certificate ID</th>
                  </tr>
                </thead>
                <tbody>
                  {certs.map((c) => (
                    <tr key={c.certId}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar avatar-md">
                            {c.student?.avatar ? (
                              <img src={c.student.avatar} className="rounded-circle" alt="avatar" />
                            ) : (
                              <div className="avatar-img rounded-circle border-white border-3 shadow d-flex align-items-center justify-content-center bg-light text-dark fw-bold fs-4">
                                {c.student?.name?.[0]?.toUpperCase() || "?"}
                              </div>
                            )}
                          </div>
                          <h6 className="mb-0 ms-3">{c.student?.name || "—"}</h6>
                        </div>
                      </td>
                      <td className="text-body-secondary">{c.student?.email || "—"}</td>
                      <td>{c.courseTitle}</td>
                      <td>{c.instructorName || "—"}</td>
                      <td className="text-center">{formatDate(c.issuedAt)}</td>
                      <td className="text-center font-monospace">{c.certId}</td>
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
    </>
  );
}
