import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import useEmailVerify from "@/app/auth/email-verify/useEmailVerify";

export default function EmailVerifyModal({ show, onHide, email, onVerifySuccess, mode = "register" }) {
  const emailVerify = useEmailVerify(email, onVerifySuccess, mode);
  const isReactivate = mode === "reactivate";

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered onEntered={() => emailVerify.inputRefs.current[0]?.focus()}
      backdrop="static"
    >
      <Form onSubmit={emailVerify.onSubmit} onPaste={emailVerify.handlePaste}>
        <Modal.Header className="border-0 position-relative">
          <Modal.Title className="w-100 text-center m-0">
            {isReactivate ? "Reactivate Your Account" : "Verify Your Email"}
          </Modal.Title>
          <button
            type="button"
            className="btn-close position-absolute end-0 top-50 translate-middle-y me-3"
            onClick={onHide}
          />
        </Modal.Header>
        <hr className="my-0 mx-0 w-100" style={{ borderTop: "2px solid #777" }} />

        <Modal.Body>
          <p className="text-center">
            Enter the 6-digit code sent to<br />
            <span className="fw-medium">{emailVerify.userEmail}</span>
          </p>

          <Row className="justify-content-center mb-4">
            {emailVerify.otp.map((value, index) => (
              <Col key={index} xs="auto" className="px-1">
                <Form.Control
                  type="text"
                  maxLength="1"
                  value={value}
                  ref={(el) => (emailVerify.inputRefs.current[index] = el)}
                  onChange={(e) => emailVerify.handleChange(e, index)}
                  onKeyDown={(e) => emailVerify.handleKeyDown(e, index)}
                  className="text-center fs-4"
                  style={{
                    width: "60px",
                    borderRadius: "8px",
                  }}
                  required
                />
              </Col>
            ))}
          </Row>

          <Button
            type="submit"
            variant="primary"
            className="w-50 mx-auto d-block"
            disabled={emailVerify.loading}
          >
            {emailVerify.loading
              ? (isReactivate ? "Reactivating..." : "Verifying...")
              : (isReactivate ? "Reactivate Account" : "Verify Email")}
          </Button>

          <div className="text-center mt-3">
            <span className="text-muted">Didn't receive the code? </span>

            <Button
              type="button"
              variant="link"
              className="p-0 align-baseline text-decoration-none"
              onClick={emailVerify.handleResendOtp}
              disabled={emailVerify.resendLoading || emailVerify.resendCooldown > 0}
            >
              {emailVerify.resendLoading
                ? "Sending..."
                : emailVerify.resendCooldown > 0
                  ? `Resend in ${emailVerify.resendCooldown}s`
                  : "Resend OTP"}
            </Button>
          </div>
        </Modal.Body>
      </Form>
    </Modal>
  );
}