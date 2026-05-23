import { useState } from "react";
import { Col, Row } from "react-bootstrap";
import { FaChevronLeft } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import EmailVerifyModal from "@/app/auth/email-verify/EmailVerifyModal";
import PageMetaData from "@/components/PageMetaData";
import { SUPPORT_EMAIL } from "@/contexts/constants";
import AuthLayout from "../components/AuthLayout";
import SignUpForm from "./components/SignUpForm";

export default function SignUpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  return <>
    <PageMetaData title="Sign-Up" />
    <AuthLayout>
      <Col xs={12} lg={6} className="m-auto position-relative d-flex flex-column justify-content-center" style={{ minHeight: "100vh" }}>
        <Row className="my-5">
          <Col sm={10} xl={8} className="m-auto position-relative">
            <div className="mb-2">
              <FaChevronLeft className="mb-1 text-primary" />
              <Link
                to="/home"
                className="ms-1 fw-semibold text-decoration-none"
              >
                Back to Home
              </Link>
            </div>
            <h2>Sign up for your account!</h2>
            <p className="lead mb-4">Nice to see you! Please Sign up with your account.</p>
            <SignUpForm
              onSignUpSuccess={(email) => {
                setRegisteredEmail(email);
                setShowVerifyModal(true);
              }}
            />
            <div className="mt-4 text-center">
              <span>
                Already have an account?<Link to={`/auth/sign-in${location.search}`}> Sign in here!</Link>
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