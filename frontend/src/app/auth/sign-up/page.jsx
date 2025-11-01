import { useState } from "react";
import PageMetaData from '@/components/PageMetaData';
import { Col, Row } from 'react-bootstrap';
import { FaFacebookF, FaGoogle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthLayout from "@/app/auth/components/AuthLayout";
import SignUpForm from "@/app/auth/sign-up/components/SignUpForm";
import EmailVerifyModal from "@/app/auth/email-verify/EmailVerifyModal";

export default function SignUpPage() {
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const navigate = useNavigate();

  return <>
    <PageMetaData title="Sign-Up" />
    <AuthLayout>
      <Col xs={12} lg={6} className="m-auto">
        <Row className="my-5">
          <Col sm={10} xl={8} className="m-auto">
            <h2>Sign up for your account!</h2>
            <p className="lead mb-4">Nice to see you! Please Sign up with your account.</p>
            <SignUpForm
              onSignUpSuccess={(email) => {
                setRegisteredEmail(email);
                setShowVerifyModal(true);
              }}
            />
            <Row>
              <div className="position-relative my-4">
                <hr />
                <p className="small position-absolute top-50 start-50 translate-middle bg-body px-5">Or</p>
              </div>
              <Col xxl={6} className="d-grid">
                <a href="#" className="btn bg-google mb-2 mb-xxl-0">
                  <FaGoogle className="text-white me-2" />
                  Signup with Google
                </a>
              </Col>
              <Col xxl={6} className="d-grid">
                <a href="#" className="btn bg-facebook mb-0">
                  <FaFacebookF className="me-2" />
                  Signup with Facebook
                </a>
              </Col>
            </Row>
            <div className="mt-4 text-center">
              <span>
                Already have an account?<Link to="/auth/sign-in"> Sign in here</Link>
              </span>
            </div>
          </Col>
        </Row>
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
