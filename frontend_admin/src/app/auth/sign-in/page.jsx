import PageMetaData from '@/components/PageMetaData';
import { Col, Row } from 'react-bootstrap';
import { Link } from "react-router-dom";
import AuthLayout from "@/app/auth/components/AuthLayout";
import SignInForm from "@/app/auth/sign-in/components/SignInForm";

export default function SignInPage() {
  
  return <>
    <PageMetaData title="Sign-In" />
    <AuthLayout>
      <Col xs={12} lg={6} className="m-auto">
        <Row className="my-5">
          <Col sm={10} xl={8} className="m-auto position-relative">
            <h1 className="fs-2">Login into EduVerse!</h1>
            <p className="lead mb-4">Nice to see you! Please log in with your account.</p>
            <SignInForm />
            {/* <div className="mt-4 text-center">
              <span>
                Don&apos;t have an account? <Link to="/auth/sign-up">Sign up now!</Link>
              </span>
            </div> */}
          </Col>
        </Row>
      </Col>
    </AuthLayout>
  </>;
}
