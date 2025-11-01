import { useLocation, Link } from "react-router-dom";
import PageMetaData from '@/components/PageMetaData';
import { Col, Row } from "react-bootstrap";
import AuthLayout from "@/app/admin/auth/components/AuthLayout";
import ResetPasswordForm from "@/app/admin/auth/reset-password/components/ResetPasswordForm";

const ResetPasswordPage = () => {
  const location = useLocation();
  const email = location.state?.email || "";

  return <>
    <PageMetaData title="Admin-Reset-Password" />
    <AuthLayout>
      <Col xs={12} lg={6} className="d-flex justify-content-center">
        <Row className="my-5">
          <Col sm={10} xl={12} className="m-auto">
            <h1 className="fs-2">Reset Password</h1>
            <h5 className="fw-light mb-4">To reset your password, enter a new password below.</h5>

            <ResetPasswordForm email={email} />

            <div className="mt-4 text-center">
              <span>
                Remembered your password?
                <Link to="/admin/auth/sign-in"> Sign in here</Link>
              </span>
            </div>
          </Col>
        </Row>
      </Col>
    </AuthLayout>
  </>;
};

export default ResetPasswordPage;