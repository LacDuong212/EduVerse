import { useState, useEffect } from "react";
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Collapse } from "react-bootstrap";
import { BsXLg, BsPlayCircleFill, BsEyeSlashFill, BsFileEarmarkPlay } from "react-icons/bs";
import { useLecture } from "./useLecture";

const Lecture = ({ show, onClose, onSave, initialLecture = null, courseId }) => {
  const { state, computed, handlers } = useLecture(show, initialLecture, onSave, courseId);
  const { form, videoState, errors, isUploading, progress } = state;
  const { previewHref } = computed;

  const [showPreview, setShowPreview] = useState(false);

  // auto-hide preview if source changes
  useEffect(() => { setShowPreview(false); }, [previewHref]);

  return (
    <Modal
      show={show}
      onHide={!isUploading ? onClose : undefined}
      backdrop={isUploading ? "static" : true}
      size="lg"
      centered
    >
      <ModalHeader className="bg-orange">
        <h5 className="modal-title text-white">{initialLecture ? "Edit Lecture" : "Add Lecture"}</h5>
        {!isUploading && (
          <button type="button" className="btn btn-sm btn-light mb-0 ms-auto" onClick={onClose}><BsXLg /></button>
        )}
      </ModalHeader>

      <ModalBody>
        <form className="row text-start g-3">
          {/* Title */}
          <Col md={12}>
            <label className="form-label">Lecture Title <span className="text-danger">*</span></label>
            <input
              className={`form-control ${errors.title ? "is-invalid" : ''}`}
              type="text"
              placeholder="Enter lecture title"
              value={form.title}
              disabled={isUploading}
              maxLength={84}
              onChange={e => handlers.updateForm("title", e.target.value)}
            />
            {errors.title && <small className="text-danger">{errors.title}</small>}
          </Col>

          {/* --- VIDEO SECTION --- */}
          <Col md={12} className="mt-3">
            <label className="form-label">Lecture Video <span className="text-danger">*</span></label>

            {/* 1. Manual Video ID Input */}
            <input
              className={`form-control ${errors.videoId ? "is-invalid" : ''}`}
              type="text"
              placeholder="Enter video ID (eg. LECxxxx...)"
              value={videoState.videoId}
              disabled={isUploading}
              onChange={handlers.handleIdChange}
            />

            <div className="mt-1">
              {errors.videoId && <small className="text-danger d-block">{errors.videoId}</small>}
            </div>

            {/* OR Divider */}
            <div className="position-relative my-3 px-3">
              <hr /><p className="small position-absolute top-50 start-50 translate-middle bg-body px-2">or</p>
            </div>

            {/* 2. File Upload Input */}
            <div className="input-group">
              <input
                className={`form-control ${errors.video ? "is-invalid" : ''}`}
                type="file"
                accept=".mp4,.mov,.mkv,.avi"
                disabled={isUploading}
                onChange={handlers.handleFileChange}
              />

              {/* Preview Toggle Button */}
              <Button
                variant="info"
                disabled={!previewHref}
                onClick={() => setShowPreview(!showPreview)}
                title={showPreview ? "Hide" : "Preview"}
              >
                {showPreview ? <BsEyeSlashFill className="me-2" /> : <BsPlayCircleFill className="me-2" />}
                {showPreview ? "Hide" : "Preview"}
              </Button>
            </div>

            {/* Status Messages */}
            <div className="mt-1">
              {videoState.fileName && (
                <small className="text-success"><BsFileEarmarkPlay className="me-1" /> Selected: {videoState.fileName}</small>
              )}
              {errors.video && <small className="text-danger d-block">{errors.video}</small>}
            </div>

            {/* Embedded Player */}
            <Collapse in={showPreview && !!previewHref}>
              <div className="mt-3">
                <div className="bg-dark rounded overflow-hidden shadow text-center">
                  <video
                    key={previewHref}
                    controls
                    className="w-100 d-block"
                    style={{ maxHeight: "300px" }}
                  >
                    <source src={previewHref} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </Collapse>

            {/* Upload Progress */}
            {isUploading && (
              <div className="progress mt-2" style={{ height: "5px" }}>
                <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: `${progress}%` }}></div>
              </div>
            )}
          </Col>

          {/* Duration Display */}
          <Col md={4} className="mt-3">
            <label className="form-label">Duration</label>
            <input
              type="text"
              className="form-control bg-light"
              readOnly
              value={form.duration > 0 ? `${Math.floor(form.duration / 60)}m ${form.duration % 60}s` : "0m 0s"}
            />
          </Col>

          {/* Description */}
          <Col xs={12} className="mt-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control" rows={3}
              value={form.description}
              placeholder="Enter lecture description"
              maxLength={360}
              disabled={isUploading}
              onChange={e => handlers.updateForm("description", e.target.value)}
            />
          </Col>

          {/* Availability */}
          <Col xs={12} className="mt-3">
            <label className="form-label me-2">Availability:</label>
            <div className="btn-group" role="group">
              <input
                type="radio" className="btn-check" name="isFree" id="optFree"
                checked={form.isFree}
                onChange={() => handlers.updateForm("isFree", true)}
                disabled={isUploading}
              />
              <label className="btn btn-sm btn-light btn-primary-soft-check border-0 m-0" htmlFor="optFree">Free</label>

              <input
                type="radio" className="btn-check" name="isFree" id="optPrem"
                checked={!form.isFree}
                onChange={() => handlers.updateForm("isFree", false)}
                disabled={isUploading}
              />
              <label className="btn btn-sm btn-light btn-primary-soft-check border-0 m-0" htmlFor="optPrem">Premium</label>
            </div>
          </Col>
        </form>
      </ModalBody>

      <ModalFooter>
        <button type="button" className="btn btn-danger-soft my-0" onClick={onClose} disabled={isUploading}>Close</button>
        <button type="button" className="btn btn-success my-0" onClick={handlers.handleSubmit} disabled={isUploading}>
          {isUploading ? "Uploading..." : "Save Lecture"}
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default Lecture;