import { useEffect, useState } from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader, Button, Col } from 'react-bootstrap';
import { BsXLg } from 'react-icons/bs';

const AddLecture = ({ show, onClose, onSave, initialLecture = null }) => {
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isFree, setIsFree] = useState(false);

  useEffect(() => {
    if (initialLecture) {
      setTitle(initialLecture.title);
      setVideoUrl(initialLecture.videoUrl);
      setDescription(initialLecture.description);
      setIsFree(initialLecture.isFree);
    } else {
      setTitle('');
      setVideoUrl('');
      setDescription('');
      setIsFree(false);
    }
  }, [initialLecture, show]);

  const handleSave = () => {
    if (!title.trim() || !videoUrl.trim()) {
      alert('Please enter both Lecture name and Video link.');
      return;
    }

    onSave({
      title,
      videoUrl,
      description,
      isFree,
      duration: 0,
    });
  };

  return (
    <Modal show={show} onHide={onClose} tabIndex={-1} aria-labelledby="addLectureLabel" aria-hidden="true">
      <ModalHeader className="bg-dark">
        <h5 className="modal-title text-white" id="addLectureLabel">
          {initialLecture ? 'Edit Lecture' : 'Add Lecture'}
        </h5>
        <button type="button" className="btn btn-sm btn-light mb-0 ms-auto" onClick={onClose} aria-label="Close">
          <BsXLg />
        </button>
      </ModalHeader>

      <ModalBody>
        <form className="row text-start g-3" onSubmit={e => e.preventDefault()}>
          <Col md={6}>
            <label className="form-label">Lecture name</label>
            <input
              className="form-control"
              type="text"
              placeholder="Enter Lecture name"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </Col>
          <Col md={6}>
            <label className="form-label">Video link</label>
            <input
              className="form-control"
              type="text"
              placeholder="Enter Video link"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
            />
          </Col>
          <Col xs={12} className="mt-3">
            <label className="form-label">Course description</label>
            <textarea
              className="form-control"
              rows={4}
              spellCheck="false"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </Col>
          <Col xs={6} className="mt-3">
            <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
              <input
                type="radio"
                className="btn-check"
                name="options"
                id="option1"
                checked={isFree}
                onChange={() => setIsFree(true)}
              />
              <label className="btn btn-sm btn-light btn-primary-soft-check border-0 m-0" htmlFor="option1">
                Free
              </label>
              <input
                type="radio"
                className="btn-check"
                name="options"
                id="option2"
                checked={!isFree}
                onChange={() => setIsFree(false)}
              />
              <label className="btn btn-sm btn-light btn-primary-soft-check border-0 m-0" htmlFor="option2">
                Premium
              </label>
            </div>
          </Col>
        </form>
      </ModalBody>

      <ModalFooter>
        <button type="button" className="btn btn-danger-soft my-0" onClick={onClose}>
          Close
        </button>
        <button type="button" className="btn btn-success my-0" onClick={handleSave}>
          Save Lecture
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default AddLecture;
