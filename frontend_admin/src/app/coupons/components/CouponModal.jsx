import { useState, useEffect } from 'react';
import { Alert, Button, Col, Form, Modal, Row } from 'react-bootstrap';

const EMPTY_FORM = {
  code: "",
  description: "",
  discountPercent: "",
  maxUsageLimit: "",
  startDate: "",
  expiryDate: ""
};

/**
 * CouponModal — handles both Create and Edit mode.
 * Props:
 *   show        — boolean
 *   onHide      — callback
 *   onSubmit    — callback(formData)
 *   initialData — coupon object for edit mode; null/undefined for create mode
 */
const CouponModal = ({ show, onHide, onSubmit, initialData }) => {
  const isEdit = !!initialData;

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (show) {
      setFormError("");
      if (initialData) {
        setFormData({
          code: initialData.code || "",
          description: initialData.description || "",
          discountPercent: String(initialData.discountPercent ?? ""),
          maxUsageLimit: String(initialData.maxUsageLimit ?? ""),
          startDate: initialData.startDate ? initialData.startDate.slice(0, 10) : "",
          expiryDate: initialData.expiryDate ? initialData.expiryDate.slice(0, 10) : ""
        });
      } else {
        setFormData(EMPTY_FORM);
      }
    }
  }, [show, initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    setFormError("");

    if (!formData.code || !formData.description || !formData.discountPercent || !formData.startDate || !formData.expiryDate) {
      setFormError("Please fill in all required fields.");
      return;
    }

    const discount = Number(formData.discountPercent);
    if (isNaN(discount) || discount < 1 || discount > 100) {
      setFormError("Discount must be between 1% and 100%.");
      return;
    }

    if (formData.maxUsageLimit !== "") {
      const limit = Number(formData.maxUsageLimit);
      if (isNaN(limit) || limit < 1) {
        setFormError("Max usage limit must be a positive number.");
        return;
      }
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.expiryDate);
    if (start >= end) {
      setFormError("Start date must be before Expiry date.");
      return;
    }

    const payload = { ...formData };
    if (payload.maxUsageLimit === "") delete payload.maxUsageLimit;

    onSubmit(payload);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Edit Coupon" : "Create New Coupon"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {formError && <Alert variant="danger" className="mb-3">{formError}</Alert>}
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Coupon Code <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="code"
                  placeholder="e.g. SUMMER2024"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  autoFocus
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Discount (%) <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="number"
                  name="discountPercent"
                  min="1"
                  max="100"
                  placeholder="1 - 100"
                  value={formData.discountPercent}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="description"
              placeholder="Describe the coupon (e.g. Summer sale for all courses)"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Expiry Date <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Max Usage Limit <span className="text-secondary small">(optional)</span></Form.Label>
            <Form.Control
              type="number"
              name="maxUsageLimit"
              min="1"
              placeholder="Leave blank for unlimited"
              value={formData.maxUsageLimit}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button variant="primary" onClick={handleSubmit}>
          {isEdit ? "Save Changes" : "Create Coupon"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CouponModal;
