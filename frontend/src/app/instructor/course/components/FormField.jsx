import { Form } from "react-bootstrap";

export const FormField = ({ controlId, label, error, children, required, className = '' }) => (
  <Form.Group controlId={controlId} className={`${className}`}>
    {label && (
      <Form.Label>
        {label} 
        {required && (
          <span className="text-danger" aria-hidden="true"> *</span>
        )}
      </Form.Label>
    )}
    
    {children}

    {/* Child input should have a "is-invalid" for the full Bootstrap red-border effect */}
    {error && (
      <Form.Control.Feedback type="invalid" style={{ display: 'block' }}>
        {error}
      </Form.Control.Feedback>
    )}
  </Form.Group>
);