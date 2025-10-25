import React from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import useEmailVerify from "./useEmailVerify";

export default function EmailVerifyModal({ show, onHide, email, mode, onVerifySuccess }) {
  const emailVerify = useEmailVerify(email, mode, onVerifySuccess);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={emailVerify.onSubmit} onPaste={emailVerify.handlePaste}>
        <Modal.Header className="border-0 position-relative">
      <Modal.Title className="w-100 text-center m-0">
        Verify Your Email
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

          <Button type="submit" variant="primary" className="w-50 mx-auto d-block" disabled={emailVerify.loading}>
            {emailVerify.loading ? "Verifying..." : "Verify Email"}
          </Button>
        </Modal.Body>
      </Form>
    </Modal>
  );
}