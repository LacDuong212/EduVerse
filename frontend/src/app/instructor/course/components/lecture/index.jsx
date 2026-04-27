import { useState, useEffect } from "react";
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Collapse } from "react-bootstrap";
import { BsXLg, BsPlayCircleFill, BsEyeSlashFill, BsFileEarmarkPlay, BsCloudCheck, BsClock } from "react-icons/bs";
import { secondsToDuration } from "@/utils/duration";
import { useLecture } from "./useLecture";

const Lecture = ({ show, onClose, onSave, initialLecture = null, courseId }) => {
  const { state, computed, handlers } = useLecture(show, initialLecture, onSave, courseId);
  const { form, videoFile, errors, isUploading, progress } = state;
  const { previewHref, isNewVideo } = computed;

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setShowPreview(false);
  }, [previewHref]);

  const hasExistingVideo = !isNewVideo && !!previewHref;

  return (
    <Modal
      show={show}
      onHide={!isUploading ? onClose : undefined}
      backdrop="static"
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
        <form className="row text-start g-3" onSubmit={handlers.handleSubmit}>
          {/* Title */}
          <Col md={12}>
            <label className="form-label">Lecture Title <span className="text-danger">*</span></label>
            <input
              className={`form-control ${errors.title ? "is-invalid" : ""}`}
              type="text"
              placeholder="Enter lecture title"
              value={form.title}
              disabled={isUploading}
              maxLength={100}
              onChange={e => handlers.updateField("title", e.target.value)}
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </Col>

          {/* --- VIDEO SECTION --- */}
          <Col md={12}>
            <label className="form-label">Lecture Video <span className="text-danger">*</span></label>

            <div className="input-group">
              <input
                className={`form-control ${errors.videoId ? "is-invalid" : ""}`}
                type="file"
                accept=".mp4,.mov,.mkv,.avi"
                disabled={isUploading}
                onChange={handlers.handleFileChange}
              />
              <Button
                variant="info"
                disabled={!previewHref}
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <BsEyeSlashFill className="me-2" /> : <BsPlayCircleFill className="me-2" />}
                {showPreview ? "Hide" : "Preview"}
              </Button>
            </div>

            <div className="mt-1">
              {isNewVideo ? (
                <small className="text-success d-flex align-items-center">
                  <BsFileEarmarkPlay className="me-1" /> New: {videoFile?.name}
                </small>
              ) : hasExistingVideo ? (
                <small className="text-primary d-flex align-items-center">
                  <BsCloudCheck className="me-1" /> Cloud video active
                </small>
              ) : null}

              {errors.videoId && <small className="text-danger d-block mt-1">{errors.videoId}</small>}
            </div>

            {/* Embedded Player */}
            <Collapse in={showPreview && !!previewHref}>
              <div className="mt-3">
                <div className="bg-dark rounded overflow-hidden shadow text-center">
                  <video key={previewHref} controls className="w-100 d-block" style={{ maxHeight: "300px" }}>
                    <source src={previewHref} type="video/mp4" />
                  </video>
                </div>
              </div>
            </Collapse>

            {isUploading && (
              <div className="mt-3">
                <div className="d-flex justify-content-between mb-1 small">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="progress" style={{ height: "8px" }}>
                  <div className="progress-bar progress-bar-striped progress-bar-animated bg-success" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}
          </Col>

          <Col className="d-flex align-items-center">
            <label className="form-label me-2 mb-0">Duration:</label>
            <div className="input-group">
              <input
                type="text"
                className={`form-control text-end ${errors.duration ? "is-invalid" : ""}`}
                disabled
                readOnly
                value={secondsToDuration(form.duration)}
              />
            </div>
            {errors.duration && <div className="invalid-feedback">{errors.duration}</div>}
          </Col>

          {/* Description */}
          <Col xs={12}>
            <label className="form-label">Description</label>
            <textarea
              className={`form-control ${errors.description ? "is-invalid" : ""}`}
              rows={3}
              value={form.description}
              placeholder="Enter lecture description"
              maxLength={360}
              disabled={isUploading}
              onChange={(e) => handlers.updateField("description", e.target.value)}
            />
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
          </Col>

          {/* Availability */}
          <Col xs={12}>
            <label className="form-label me-2 mb-0">Availability:</label>
            <div className="btn-group" role="group">
              <input
                type="radio" className="btn-check" name="isFree" id="optFree"
                checked={form.isFree === true}
                onChange={() => handlers.updateField("isFree", true)}
                disabled={isUploading}
              />
              <label className="btn btn-sm btn-outline-primary m-0" htmlFor="optFree">Free</label>
              <input
                type="radio" className="btn-check" name="isFree" id="optPrem"
                checked={form.isFree === false}
                onChange={() => handlers.updateField("isFree", false)}
                disabled={isUploading}
              />
              <label className="btn btn-sm btn-outline-primary m-0" htmlFor="optPrem">Premium</label>
            </div>
            {errors.isFree && <div className="d-block text-danger small mt-1">{errors.isFree}</div>}
          </Col>
        </form>
      </ModalBody>

      <ModalFooter>
        <button type="button" className="btn btn-danger-soft my-0" onClick={onClose} disabled={isUploading}>Close</button>
        <button type="button" className="btn btn-success my-0" onClick={handlers.handleSubmit} disabled={isUploading}>
          {isUploading ? <><span className="spinner-border spinner-border-sm me-2"></span>Uploading...</> : "Save Lecture"}
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default Lecture;