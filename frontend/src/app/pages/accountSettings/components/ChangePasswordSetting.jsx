import { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Alert, Row, Col, Form } from "react-bootstrap";
import { BsXLg } from "react-icons/bs";
import { FaKey, FaLock } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import IconPasswordFormInput from "@/components/form/IconPasswordFormInput";
import useToggle from "@/hooks/useToggle";
import { authApi } from "@/utils/api";
import { handleRequest } from "@/utils/request";

const complexPasswordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password is too long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter, one uppercase letter, one number, one special character")
  .regex(/[A-Z]/, "Password must contain at least one lowercase letter, one uppercase letter, one number, one special character")
  .regex(/[0-9]/, "Password must contain at least one lowercase letter, one uppercase letter, one number, one special character")
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain at least one lowercase letter, one uppercase letter, one number, one special character");

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: complexPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password does not match.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from old password.",
    path: ["newPassword"],
  });

const ChangePasswordSetting = () => {
  const { isTrue: isOpen, toggle } = useToggle();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (data) => {
    setError("");
    setSuccess("");
    setLoading(true);

    const res = await handleRequest(authApi.post("/user/change-password", {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword
    }));

    if (res.success) {
      setSuccess("Password changed successfully!");
      reset();

      setTimeout(() => {
        toggle();
        setSuccess("");
      }, 2000);
    } else {
      setError(res.message || "Something went wrong..");
    }

    setLoading(false);
  };

  const handleModalClose = () => {
    reset();
    setError("");
    setSuccess("");
    toggle();
  };

  return (
    <>
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
          </div>
        </div>
      </div>

      <Modal
        onHide={handleModalClose}
        show={isOpen}
        className="fade"
        id="changePassword"
        tabIndex={-1}
        aria-labelledby="changePasswordLabel"
        aria-hidden="true"
        centered
      >
        <ModalHeader className="modal-header bg-dark">
          <h5 className="modal-title text-white" id="changePasswordLabel">
            Change Password
          </h5>
          <button onClick={handleModalClose} type="button" className="btn btn-sm btn-light mb-0 ms-auto" data-bs-dismiss="modal" aria-label="Close">
            <BsXLg />
          </button>
        </ModalHeader>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody className="modal-body">
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Row className="g-3">
              <Col xs={12}>
                <IconPasswordFormInput
                  control={control}
                  icon={FaKey}
                  placeholder="Enter old password"
                  label="Old Password"
                  name="oldPassword"
                  disabled={loading}
                  error={errors.oldPassword}
                  required
                />
              </Col>
              <Col xs={12}>
                <IconPasswordFormInput
                  control={control}
                  icon={FaLock}
                  placeholder="Enter new password"
                  label="New Password"
                  name="newPassword"
                  disabled={loading}
                  error={errors.newPassword}
                  required
                />
              </Col>
              <Col xs={12}>
                <IconPasswordFormInput
                  control={control}
                  icon={FaLock}
                  placeholder="Re-enter new password"
                  label="Confirm New Password"
                  name="confirmPassword"
                  disabled={loading}
                  error={errors.confirmPassword}
                  required
                />
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <button type="button" onClick={handleModalClose} className="btn btn-danger-soft my-0" data-bs-dismiss="modal">
              Close
            </button>
            <Button type="submit" variant="success" className="my-0" disabled={loading}>
              {loading ? "Saving..." : "Change Password"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </>
  );
};

export default ChangePasswordSetting;