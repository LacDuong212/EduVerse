import _ from "lodash";
import { useMemo } from "react";
import { Container, Button } from "react-bootstrap";
import { FaArrowLeft, FaRotateRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const ErrorState = ({
  className = "position-absolute top-50 start-50 translate-middle d-flex flex-column align-items-center justify-content-center gap-3",
  message = "",
  messages = [],
  onRetry,
  retryBtnName = "Retry",
  showReturn = false,
  onReturn,
  returnBtnName = "Return",
  ...props
}) => {
  const navigate = useNavigate();

  const defaultMessages = useMemo(() => [
    "It's quiet in here... too quiet. 🌵🏜️",
    "Uh-oh, looks like something went wrong..🤔",
    "Our servers are currently having an existential crisis..🧘‍♂️⚡",
  ], []);

  const displayMessage = useMemo(() => {
    if (message) return message;

    if (messages && messages.length > 0) {
      return _.sample(messages);
    }

    return _.sample(defaultMessages);
  }, [message, messages, defaultMessages]);

  const handleReturn = onReturn || (() => navigate(-1));

  return (
    <Container className={className} {...props}>
      {/* Message */}
      <span className="h3 mb-0 text-center">{displayMessage}</span>

      {/* Actions */}
      <div className="d-flex align-items-center gap-5">
        {showReturn && (
          <Button
            variant="link"
            onClick={handleReturn}
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