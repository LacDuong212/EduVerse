import PageMetaData from '@/components/PageMetaData';
import { Col, Row } from "react-bootstrap";
import { FaChevronLeft } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "@/app/auth/components/AuthLayout";
import ForgotPasswordForm from "@/app/auth/forgot-password/components/ForgotPasswordForm";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  return <>
    <PageMetaData title="Forgot-Password" />
    <AuthLayout>
      <Col xs={12} lg={6} className="d-flex justify-content-center">
        <Row className="my-5">
          <Col sm={10} xl={12} className="m-auto position-relative">
            <div className='mb-3'>
              <FaChevronLeft className='mb-1 text-primary' />
              <Link
                to="/"
                className="ms-1 fw-semibold text-decoration-none"
              >
                Back to Home
              </Link>
            </div>
            <h1 className="fs-2">Forgot Password?</h1>
            <h5 className="fw-light mb-4">To create new password, enter your email address below.</h5>

            <ForgotPasswordForm
              onForgotSuccess={(email) => {
                navigate("/auth/reset-password", { state: { email: email } });
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

    </AuthLayout>
  </>;
};

export default ForgotPasswordPage;
