import { Col, Modal, ModalBody, ModalFooter, ModalHeader } from "react-bootstrap";
import { BsXLg } from "react-icons/bs";
import useSection from "./useSection";

const Section = ({ show, onClose, onSave, initialSection = null }) => {
  const { 
    title, 
    handleSave, 
    handleChange, 
    isEditMode 
  } = useSection(show, initialSection, onSave);

  const onFormSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSave();
  };

  return (
    <Modal
      className="fade"
      show={show}
      tabIndex={-1}
      aria-labelledby="addSectionLabel"
      aria-hidden={false} 
      aria-modal={true}
      onHide={onClose}
      onClick={(e) => e.stopPropagation()} // prevent clicks inside modal from closing parent listeners
      centered
    >
      <ModalHeader className="bg-info">
        <h5 className="modal-title text-white" id="addSectionLabel">
          {isEditMode ? "Edit Section" : "Add Section"}
        </h5>
        <button
          type="button"
          className="btn btn-sm btn-light mb-0 ms-auto"
          onClick={onClose}
          aria-label="Close"
        >
          <BsXLg />
        </button>
      </ModalHeader>

      <ModalBody>
        <form className="row text-start g-3" onSubmit={onFormSubmit}>
          {/* #TODO: section bulleting */}
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
              onChange={handleChange}
              autoFocus
            />
          </Col>
          {/* Hidden button enables "Enter" key submission */}
          <button type="submit" className="d-none"></button>
        </form>
      </ModalBody>

      <ModalFooter>
        <button type="button" className="btn btn-danger-soft my-0" onClick={onClose}>
          Cancel
        </button>
        <button 
          type="button" 
          className={`btn my-0 ${title.trim() ? "btn-success" : "btn-secondary"}`}
          onClick={handleSave}
          disabled={!title.trim()}
        >
          {isEditMode ? "Save Changes" : "Add Section"}
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default Section;