import PageMetaData from '@/components/PageMetaData';
import { Col, Row } from 'react-bootstrap';
import { FaChevronLeft, FaGoogle } from "react-icons/fa";
import { Link } from "react-router-dom";
import AuthLayout from "@/app/auth/components/AuthLayout";
import SignInForm from "@/app/auth/sign-in/components/SignInForm";

export default function SignInPage() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  return <>
    <PageMetaData title="Sign-In" />
    <AuthLayout>
      <Col xs={12} lg={6} className="m-auto">
        <Row className="my-5">
          <Col sm={10} xl={8} className="m-auto position-relative">
            <div className='mb-3'>
              <FaChevronLeft className='mb-1 text-primary' />
              <Link
                to="/"
                className="ms-1 fw-semibold text-decoration-none"
              >
                Back to Home
              </Link>
            </div>
            <h1 className="fs-2">Login into EduVerse!</h1>
            <p className="lead mb-4">Nice to see you! Please log in with your account.</p>
            <SignInForm />
            <Row>
              <div className="position-relative my-4">
                <hr />
                <p className="small position-absolute top-50 start-50 translate-middle bg-body px-5">Or</p>
              </div>
              <Col xxl={12} className="d-grid">
                <a href={`${backendUrl}/api/auth/google`} className="btn bg-google mb-2 mb-xxl-0">
                  <FaGoogle className="text-white me-2" />
                  Sign in with Google
                </a>
              </Col>
            </Row>
            <div className="mt-4 text-center">
              <span>
                Don&apos;t have an account? <Link to="/auth/sign-up">Sign up now!</Link>
              </span>
            </div>
          </Col>
        </Row>
      </Col>
    </AuthLayout>
  </>;
}
