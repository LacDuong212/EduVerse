import { useState } from "react";
import { Col, Row } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import ForgotPasswordForm from "./components/ForgotPasswordForm";
import EmailVerifyModal from "../email-verify/EmailVerifyModal";

const ForgotPasswordPage = () => {
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");
  const navigate = useNavigate();

  return <>
      <AuthLayout>
        <Col xs={12} lg={6} className="d-flex justify-content-center">
          <Row className="my-5">
            <Col sm={10} xl={12} className="m-auto">
              <h1 className="fs-2">Forgot Password?</h1>
              <h5 className="fw-light mb-4">To create new password, enter your email address below.</h5>

              <ForgotPasswordForm 
                onForgotSuccess={(email) => {
                  setTargetEmail(email);
                  setShowVerifyModal(true);
                }}
              />

              <div className="mt-4 text-center">
              <span>
                Remembered your password?
                <Link to="/auth/sign-in"> Sign in here</Link>
              </span>
            </div>

            </Col>
          </Row>
        </Col>

        <EmailVerifyModal
          show={showVerifyModal}
          onHide={() => setShowVerifyModal(false)}
          email={targetEmail}
          mode="forgot"
          onVerifySuccess={() => {
            setShowVerifyModal(false);
            navigate("/auth/reset-password", { state: { email: targetEmail } });
          }}
        />

      </AuthLayout>
    </>;
};

export default ForgotPasswordPage;
