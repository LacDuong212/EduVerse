import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const CouponModal = ({ show, onHide, onSubmit }) => {
    const [formData, setFormData] = useState({
        code: "",
        description: "",
        discountPercent: "",
        startDate: "",
        expiryDate: ""
    });

    useEffect(() => {
        if (show) {
            setFormData({ code: "", description: "", discountPercent: "", startDate: "", expiryDate: "" });
        }
    }, [show]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        if (!formData.code || !formData.description || !formData.discountPercent || !formData.startDate || !formData.expiryDate) {
            alert("Please fill all fields");
            return;
        }

        const discount = Number(formData.discountPercent);
        if (discount < 1 || discount > 100) {
            alert("Discount must be between 1% and 100%");
            return;
        }

        const start = new Date(formData.startDate);
        const end = new Date(formData.expiryDate);

        if (start >= end) {
            alert("Start date must be before Expiry date");
            return;
        }

        onSubmit(formData);
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg"> {/* Tăng size modal */}
            <Modal.Header closeButton>
                <Modal.Title>Create New Coupon</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Coupon Code</Form.Label>
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
                                <Form.Label>Discount (%)</Form.Label>
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
                        <Form.Label>Description</Form.Label>
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
                                <Form.Label>Start Date</Form.Label>
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
                                <Form.Label>Expiry Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Close</Button>
                <Button variant="primary" onClick={handleSubmit}>Create Coupon</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CouponModal;