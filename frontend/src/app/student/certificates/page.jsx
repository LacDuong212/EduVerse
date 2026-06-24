import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Col, Container, Row, Spinner } from "react-bootstrap";
import { FaCertificate, FaLinkedin, FaEye } from "react-icons/fa";
import { authApi } from "@/utils/api";
import { DEFAULT_COURSE_IMG } from "@/contexts/constants";
import PageMetaData from "@/components/PageMetaData";

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

const CertCard = ({ cert }) => {
  const verifyUrl = `${window.location.origin}/certificates/${cert.certId}`;
  const shareLinkedIn = () =>
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`,
      "_blank",
      "noopener,noreferrer"
    );

  return (
    <Card className="h-100 border shadow-sm">
      <div className="position-relative">
        <img
          src={cert.thumbnail || DEFAULT_COURSE_IMG}
          alt={cert.courseTitle}
          onError={(e) => (e.target.src = DEFAULT_COURSE_IMG)}
          style={{ width: "100%", height: 150, objectFit: "cover" }}
          className="card-img-top"
        />
        <span className="badge bg-success position-absolute top-0 end-0 m-2 d-flex align-items-center gap-1">
          <FaCertificate /> Certified
        </span>
      </div>
      <Card.Body className="d-flex flex-column">
        <h6 className="mb-1 text-truncate-2" title={cert.courseTitle}>
          {cert.courseTitle}
        </h6>
        {cert.instructorName && (
          <p className="small text-body mb-2">by {cert.instructorName}</p>
        )}
        <p className="small text-body mb-3">Issued {formatDate(cert.issuedAt)}</p>

        <div className="mt-auto d-flex gap-2">
          <Link
            to={`/certificates/${cert.certId}`}
            className="btn btn-sm btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-1"
          >
            <FaEye /> View
          </Link>
          <button
            className="btn btn-sm btn-outline-primary d-flex align-items-center"
            onClick={shareLinkedIn}
            title="Share on LinkedIn"
          >
            <FaLinkedin />
          </button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default function StudentCertificatesPage() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    authApi
      .get("/certificates/me")
      .then((res) => {
        if (!cancelled) setCerts(res.data?.result || []);
      })
      .catch(() => {
        if (!cancelled) setCerts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Container className="py-4">
      <PageMetaData title="My Certificates" />

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : certs.length === 0 ? (
        <Card className="text-center p-5 border-0 shadow-sm">
          <FaCertificate size={48} className="text-body opacity-25 mx-auto mb-3" />
          <h5>No certificates yet</h5>
          <p className="text-body mb-3">
            Complete a course to earn your first certificate.
          </p>
          <Link to="/student/courses" className="btn btn-primary mx-auto">
            Go to My Learning
          </Link>
        </Card>
      ) : (
        <Row className="g-4">
          {certs.map((cert) => (
            <Col key={cert.certId} xs={12} sm={6} lg={4} xl={3}>
              <CertCard cert={cert} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
