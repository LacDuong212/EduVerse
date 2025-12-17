import { useState } from 'react';
import useToggle from '@/hooks/useToggle';
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader } from 'react-bootstrap';
import { BsXLg } from 'react-icons/bs';
import { FaPlus } from 'react-icons/fa';

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

  const onFormSubmit = (e) => {
    e.preventDefault();   // stop page refresh
    e.stopPropagation();  // stops event from reaching parent form
    handleSave();
  };

  return (
    <>
      <Button variant="info-soft" size="sm" onClick={toggle} className="mb-0">
        <FaPlus className="mb-1 me-1" />
        Add Section
      </Button>

      <Modal
        className="fade"
        show={isTrue}
        tabIndex={-1}
        aria-labelledby="addSectionLabel"
        aria-hidden="true"
        onHide={handleCancel}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader className="bg-info">
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
          <form className="row text-start g-3" onSubmit={onFormSubmit}>
            <Col xs={12}>
              <label className="form-label">
                Section Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter section title"
                value={title}
                maxLength={56}
                onChange={e => setTitle(e.target.value)}
                autoFocus
              />
            </Col>
            {/* hidden button to prevent triggering outside of modal */}
            <button type="submit" className="d-none"></button>
          </form>
        </ModalBody>

        <ModalFooter>
          <button type="button" className="btn btn-danger-soft my-0" onClick={handleCancel}>
            Cancel
          </button>
          {(title && title.trim()) ? 
            <button type="button" className="btn btn-success my-0" onClick={handleSave}>
              Save Section
            </button>
          : (
            <button type="button" className="btn my-0" disabled>
              Save Section
            </button>
          )}
        </ModalFooter>
      </Modal>
    </>
  );
};

export default AddSection;
