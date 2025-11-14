import { useState } from 'react';
import useToggle from '@/hooks/useToggle';
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader } from 'react-bootstrap';
import { BsPlusCircle, BsXLg } from 'react-icons/bs';

const AddSection = ({ onAddSection }) => {
  const { isTrue, toggle } = useToggle();
  const [title, setTitle] = useState('');

  const handleSave = () => {
    if (!title.trim()) return; // validation: no empty title

    onAddSection({ section: title, lectures: [] });
    setTitle('');
    toggle(); // close modal
  };

  const handleCancel = () => {
    setTitle('');
    toggle();
  };

  return (
    <>
      <Button variant="primary-soft" size="sm" onClick={toggle} className="mb-0">
        <BsPlusCircle className="me-2" />
        Add Section
      </Button>

      <Modal
        className="fade"
        show={isTrue}
        tabIndex={-1}
        aria-labelledby="addSectionLabel"
        aria-hidden="true"
        onHide={handleCancel}
      >
        <ModalHeader className="bg-dark">
          <h5 className="modal-title text-white" id="addSectionLabel">
            Add Section
          </h5>
          <button
            type="button"
            className="btn btn-sm btn-light mb-0 ms-auto"
            onClick={handleCancel}
            aria-label="Close"
          >
            <BsXLg />
          </button>
        </ModalHeader>

        <ModalBody>
          <form className="row text-start g-3" onSubmit={e => e.preventDefault()}>
            <Col xs={12}>
              <label className="form-label">
                Section Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter section title"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </Col>
          </form>
        </ModalBody>

        <ModalFooter>
          <button type="button" className="btn btn-danger-soft my-0" onClick={handleCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-success my-0" onClick={handleSave}>
            Save Section
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default AddSection;
