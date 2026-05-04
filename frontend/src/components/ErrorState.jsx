import React from "react";
import { Container, Button } from "react-bootstrap";
import { FaArrowLeft, FaRotateRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const ErrorState = ({
  className = "position-absolute top-50 start-50 translate-middle d-flex flex-column align-items-center justify-content-center gap-3",
  message = "Uh-oh, looks like something went wrong..🤔",
  onRetry,
  retryBtnName = "Retry",
  showReturn = false,
  onReturn,
  returnBtnName = "Return",
}) => {
  const navigate = useNavigate();
  const defaultRetry = () => navigate(-1);

  return (
    <Container className={className}>
      {/* Message */}
      <span className="h3 mb-0 text-center">{message}</span>

      {/* Actions */}
      <div className="d-flex align-items-center gap-5">
        {showReturn && (
          <Button
            variant="link"
            onClick={onReturn ? onReturn : defaultRetry}
            className="p-0 d-flex align-items-center mb-0"
          >
            <FaArrowLeft className="me-2" />{returnBtnName}
          </Button>
        )}
        {onRetry && (
          <Button
            variant="link"
            onClick={onRetry}
            className="p-0 d-flex align-items-center mb-0"
          >
            <FaRotateRight className="me-2" />{retryBtnName}
          </Button>
        )}
      </div>
    </Container>
  );
};

export default ErrorState;