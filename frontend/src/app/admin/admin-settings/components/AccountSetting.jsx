import useToggle from '@/hooks/useToggle';
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader } from 'react-bootstrap';
import { BsXLg } from 'react-icons/bs';
const AccountSetting = () => {
  const {
    isTrue: isOpen,
    toggle
  } = useToggle();
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
            <p className="mb-0 small h6">Last change 10 Aug 2020</p>
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
        <ModalBody className="modal-body">
          <form className="row">
            <p className="mb-2">Your password has expired, Please choose a new password</p>
            <Col xs={12}>
              <label className="form-label">
                Old Password <span className="text-danger">*</span>
              </label>
              <input type="Password" className="form-control" placeholder="Enter old password" />
            </Col>
            <p className="mb-2 mt-4">Your password must be at least eight characters and cannot contain space.</p>
            <Col xs={12} className="mb-3">
              <label className="form-label">
                New Password <span className="text-danger">*</span>
              </label>
              <input type="password" className="form-control" placeholder="Enter new password" />
            </Col>
            <Col xs={12}>
              <label className="form-label">
                Confirm Password <span className="text-danger">*</span>
              </label>
              <input type="password" className="form-control" placeholder="Enter confirm password" />
            </Col>
          </form>
        </ModalBody>
        <ModalFooter>
          <button type="button" onClick={toggle} className="btn btn-danger-soft my-0" data-bs-dismiss="modal">
            Close
          </button>
          <button type="button" className="btn btn-success my-0">
            Change Password
          </button>
        </ModalFooter>
      </Modal>
    </>;
};
export default AccountSetting;
