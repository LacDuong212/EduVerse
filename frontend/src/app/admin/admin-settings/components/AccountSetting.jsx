import React, { useState } from 'react';
import useToggle from '@/hooks/useToggle';
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Form, Alert } from 'react-bootstrap';
import { BsXLg } from 'react-icons/bs';
import axios from 'axios';

const AccountSetting = () => {

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { isTrue: isOpen, toggle } = useToggle();

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu mới không khớp.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const res = await axios.patch(`${backendUrl}/api/admin/profile/change-password`, {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      }, config);

      if (res.data.success) {
        setSuccess('Đổi mật khẩu thành công!');
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          toggle();
          setSuccess('');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return <>
    <div className="bg-light rounded-3 p-4 mb-3">
      <div className="d-md-flex justify-content-between align-items-center">
        <div>
          <h6 className="h5">Change Password</h6>
          <p className="mb-1 mb-md-0">Set a unique password to protect your account.</p>
        </div>
        <div>
          <Button onClick={toggle} className="btn btn-primary mb-1" data-bs-toggle="modal" data-bs-target="#changePassword">
            Change Password
          </Button>
          {/* <p className="mb-0 small h6">Last change 10 Aug 2020</p> */}
        </div>
      </div>
    </div>
    <Modal onHide={toggle} show={isOpen} className="fade" id="changePassword" tabIndex={-1} aria-labelledby="changePasswordLabel" aria-hidden="true">
      <ModalHeader className="modal-header bg-dark">
        <h5 className="modal-title text-white" id="changePasswordLabel">
          Change Password
        </h5>
        <button onClick={toggle} type="button" className="btn btn-sm btn-light mb-0 ms-auto" data-bs-dismiss="modal" aria-label="Close">
          <BsXLg />
        </button>
      </ModalHeader>

      <Form onSubmit={handleSubmit}>
        <ModalBody className="modal-body">
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <p className="mb-2">Your password has expired, Please choose a new password</p>
          <Col xs={12}>
            <Form.Label>
              Old Password <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter old password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              required
            />
          </Col>
          <p className="mb-2 mt-4">Your password must be at least eight characters and cannot contain space.</p>
          <Col xs={12} className="mb-3">
            <Form.Label>
              New Password <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter new password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
          </Col>
          <Col xs={12}>
            <Form.Label>
              Confirm Password <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter confirm password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </Col>
        </ModalBody>
        <ModalFooter>
          <button type="button" onClick={toggle} className="btn btn-danger-soft my-0" data-bs-dismiss="modal">
            Close
          </button>
          <Button type="submit" variant="success" className="my-0" disabled={loading}>
            {loading ? 'Saving...' : 'Change Password'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  </>;
};
export default AccountSetting;
