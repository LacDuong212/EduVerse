import { useState } from "react";
import { Col, Row } from "react-bootstrap";
import { FaChevronLeft, FaGoogle } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "@/app/auth/components/AuthLayout";
import EmailVerifyModal from "@/app/auth/email-verify/EmailVerifyModal";
import PageMetaData from "@/components/PageMetaData";
import { SUPPORT_EMAIL } from "@/contexts/constants";
import SignInForm from "./components/SignInForm";

export default function SignInPage() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const location = useLocation();
  const navigate = useNavigate();
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  return <>
    <PageMetaData title="Sign-In" />
    <AuthLayout>
      <Col xs={12} lg={6} className="m-auto position-relative d-flex flex-column justify-content-center" style={{ minHeight: "100vh" }}>
        <Row className="my-5">
          <Col sm={10} xl={8} className="m-auto position-relative">
            <div className="mb-3">
              <FaChevronLeft className="mb-1 text-primary" />
              <Link
                to="/home"
                className="ms-1 fw-semibold text-decoration-none"
              >
                Back to Home
              </Link>
            </div>
            <h1 className="fs-2">Login into EduVerse!</h1>
            <p className="lead mb-4">Nice to see you! Please log in with your account.</p>
            <SignInForm
              onSignUpSuccess={(email) => {
                setRegisteredEmail(email);
                setShowVerifyModal(true);
              }}
            />
            <Row>
              <div className="position-relative my-3 px-5">
                <hr /><p className="small position-absolute top-50 start-50 translate-middle bg-body px-2">or</p>
              </div>
              <Col xxl={12} className="d-grid">
                <a href={`${backendUrl}/api/auth/google${location.search}`} className="btn bg-google mb-0">
                  <FaGoogle className="text-white me-2" />
                  Sign in with Google
                </a>
              </Col>
            </Row>
            <div className="mt-4 text-center">
              <span>
                Don&apos;t have an account? <Link to={`/auth/sign-up${location.search}`}>Sign up now!</Link>
              </span>
            </div>
          </Col>
        </Row>
        <div className="position-absolute bottom-0 start-50 translate-middle-x pb-3 text-center small w-100">
          Having trouble? You can email{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-primary text-decoration-none fw-semibold"
          >
            {SUPPORT_EMAIL}
          </a>{" "}
          for support!
        </div>
      </Col>

      <EmailVerifyModal
        show={showVerifyModal}
        onHide={() => setShowVerifyModal(false)}
        email={registeredEmail}
        mode="register"
        onVerifySuccess={() => {
          setShowVerifyModal(false);
          navigate("/auth/sign-in");
        }}
      />
    </AuthLayout>
  </>;
}