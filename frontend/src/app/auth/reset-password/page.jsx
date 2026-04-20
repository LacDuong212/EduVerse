import { Col, Row } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import PageMetaData from "@/components/PageMetaData";
import AuthLayout from "@/app/auth/components/AuthLayout";
import ResetPasswordForm from "./components/ResetPasswordForm";

const ResetPasswordPage = () => {
  const location = useLocation();
  const email = location.state?.email || "";

  if (!email) {
    toast.error("Failed to get your email. Please try again later!");

    return (
      <>
        <PageMetaData title="Reset-Password" />
        <AuthLayout>
          <Col xs={12} lg={6} className="d-flex justify-content-center">
            <Row className="my-5">
              <Col sm={10} xl={12} className="m-auto">
                <h1 className="fs-2">Reset Password</h1>
                <p className="lead mb-4">Resetting password requires your <strong>email</strong>. Please return to the previous step and try again!</p>
              </Col>
            </Row>
          </Col>
        </AuthLayout>
      </>
    );
  }

  return <>
    <PageMetaData title="Reset-Password" />
    <AuthLayout>
      <Col xs={12} lg={6} className="d-flex justify-content-center">
        <Row className="my-5">
          <Col sm={10} xl={12} className="m-auto">
            <h1 className="fs-2">Reset Password</h1>
            <p className="lead mb-4">To reset your password, enter a new password below.</p>

            <ResetPasswordForm email={email} />

            <div className="mt-4 text-center">
              <span>
                Remembered your password?
                <Link to={`/auth/sign-in${email ? `?email=${encodeURIComponent(email)}` : ""}`}> Sign in here</Link>
              </span>
            </div>
          </Col>
        </Row>
      </Col>
    </AuthLayout>
  </>;
};

export default ResetPasswordPage;