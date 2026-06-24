import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Container, Spinner } from "react-bootstrap";
import { FaCheckCircle, FaLinkedin, FaPrint, FaStar } from "react-icons/fa";
import { api } from "@/utils/api";
import PageMetaData from "@/components/PageMetaData";
import "./certificate.css";

const formatDate = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

export default function CertificateVerifyPage() {
  const { certId } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get(`/certificates/${certId}`)
      .then((res) => {
        if (!cancelled) setCert(res.data?.result || null);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err?.response?.data?.message || "Certificate not found or invalid."
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [certId]);

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Verifying certificate...</p>
      </Container>
    );
  }

  if (error || !cert) {
    return (
      <Container className="py-5 text-center">
        <h4 className="text-danger">Certificate Not Found</h4>
        <p className="text-body">{error || "This certificate does not exist."}</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <PageMetaData title={`Certificate — ${cert.courseTitle}`} />

      <div className="cert-frame">
        {/* Decorative blue & gold geometry (top-left + bottom-left) */}
        <div className="sq sq-navy-dark tl1" />
        <div className="sq sq-navy tl2" />
        <div className="sq sq-gold tl3" />
        <div className="sq sq-navy tl4" />
        <div className="bar-gold bar1" />
        <div className="bar-gold bar2" />
        <div className="sq sq-navy-dark bl1" />
        <div className="sq sq-gold bl2" />

        <div className="cert-content">
          <h1 className="cert-title">CERTIFICATE</h1>
          <div className="cert-type">OF COMPLETION</div>

          <p className="cert-presented">Proudly presented to</p>
          <h2 className="cert-name">{cert.studentName}</h2>

          <p className="cert-desc">
            has successfully completed the course{" "}
            <strong>{cert.courseTitle}</strong>
            {cert.instructorName && <> under the guidance of {cert.instructorName}</>}
            {" "}on the EduVerse learning platform.
          </p>

          <div className="cert-bottom">
            <div className="cert-sign">
              <div className="cert-sign-line" />
              <span>{cert.instructorName || "Instructor"}</span>
            </div>

            <div className="cert-medal" aria-label="award seal">
              <div className="cert-medal-ribbon left" />
              <div className="cert-medal-ribbon right" />
              <div className="cert-medal-circle">
                <div className="cert-medal-inner">
                  <FaStar />
                </div>
              </div>
            </div>

            <div className="cert-sign">
              <div className="cert-sign-line" />
              <span>EduVerse</span>
            </div>
          </div>

          <div className="cert-meta">
            <FaCheckCircle className="text-success me-1" />
            Verified by EduVerse · ID: {cert.certId} · Issued {formatDate(cert.issuedAt)}
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-center gap-3 mt-4 cert-actions">
        <Button variant="primary" onClick={shareToLinkedIn}>
          <FaLinkedin className="me-2" /> Share on LinkedIn
        </Button>
        <Button variant="outline-secondary" onClick={() => window.print()}>
          <FaPrint className="me-2" /> Print / Save PDF
        </Button>
      </div>
    </Container>
  );
}
