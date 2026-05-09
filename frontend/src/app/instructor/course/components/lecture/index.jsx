import { useState, useEffect } from "react";
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Collapse } from "react-bootstrap";
import { BsXLg, BsPlayCircleFill, BsCloudUpload } from "react-icons/bs";
import { secondsToDuration } from "@/utils/duration";
import { useLecture } from "./useLecture";

const Lecture = ({ show, onClose, onSave, initialLecture = null }) => {
  const { state, handlers } = useLecture(show, initialLecture, onSave);
  const { form, videoFile, errors, isUploading, progress, previewHref } = state;

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!show) setShowPreview(false);
  }, [show, previewHref]);

  const hasVideoSource = !!previewHref;
  const isNewVideo = !!videoFile;

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
              className={`form-control ${errors?.title ? "is-invalid" : ""}`}
              type="text"
              placeholder="Enter lecture title"
              value={form.title}
              disabled={isUploading}
              onChange={e => handlers.updateField("title", e.target.value)}
            />
            {errors?.title && <div className="invalid-feedback">{errors.title}</div>}
          </Col>

          {/* --- VIDEO SECTION --- */}
          <Col md={12}>
            <label className="form-label">Lecture Video <span className="text-danger">*</span></label>

            <div className={`card border border-dashed border-2 ${errors?.videoId ? "border-danger" : ""}`}>
              <div className="card-body p-3">

                {/* Preview */}
                {hasVideoSource && !isUploading ? (
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <div className="bg-dark rounded d-flex align-items-center justify-content-center me-3" style={{ width: "60px", height: "40px" }}>
                        <BsPlayCircleFill className="text-white" />
                      </div>
                      <div>
                        <small className={isNewVideo ? "text-info" : "text-success"}>
                          {isNewVideo ? "Ready to upload" : "Already saved"}
                        </small>
                      </div>
                    </div>

                    <div className="btn-group align-items-center">
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        className="mb-0"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        {showPreview ? "Close Preview" : "View Video"}
                      </Button>
                      <label className="btn btn-sm btn-outline-primary mb-0">
                        Change
                        <input
                          type="file"
                          className="d-none"
                          accept="video/mp4,video/webm,video/ogg,.mp4,.webm,.ogv,.ogg"
                          onChange={handlers.handleFileChange}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  /* Empty */
                  <div className="text-center py-2">
                    {!isUploading ? (
                      <label className="mb-0 cursor-pointer">
                        <BsCloudUpload size={30} className="text-primary mb-2" />
                        <p className="h6 mb-0">Click to upload lecture video</p>
                        <p className="small mb-0">MP4, MOV, or OGG (Max 2GB)</p>
                        <input
                          type="file"
                          className="d-none"
                          accept="video/mp4,video/webm,video/ogg,.mp4,.webm,.ogv,.ogg"
                          onChange={handlers.handleFileChange}
                        />
                      </label>
                    ) : (
                      /* Uploading */
                      <div className="w-100">
                        <div className="d-flex justify-content-between mb-2 small">
                          <span className="fw-bold">Uploading Video...</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="progress" style={{ height: "10px" }}>
                          <div
                            className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Integrated Preview Player */}
            <Collapse in={showPreview && hasVideoSource}>
              <div className="mt-3 bg-dark rounded shadow-inner overflow-hidden">
                {show && hasVideoSource && (
                  <video
                    key={previewHref}
                    controls
                    className="w-100"
                    style={{ maxHeight: "250px", display: "block" }}
                    preload="metadata"
                  >
                    <source src={previewHref} />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </Collapse>

            {errors?.videoId && <div className="text-danger small mt-2">{errors.videoId}</div>}
          </Col>

          {/* Duration */}
          <Col className="d-flex align-items-center">
            <label className="form-label me-2 mb-0">Duration:</label>
            <div className="input-group">
              <input
                type="text"
                className={`form-control text-end ${errors?.duration ? "is-invalid" : ""}`}
                disabled
                readOnly
                value={secondsToDuration(form.duration)}
              />
            </div>
            {errors?.duration && <div className="invalid-feedback">{errors.duration}</div>}
          </Col>

          {/* Description */}
          <Col xs={12}>
            <label className="form-label">Description</label>
            <textarea
              className={`form-control ${errors?.description ? "is-invalid" : ""}`}
              rows={3}
              defaultValue={form.description}
              placeholder="Enter lecture description"
              disabled={isUploading}
              onChange={(e) => handlers.updateField("description", e.target.value)}
            />
            {errors?.description && <div className="invalid-feedback">{errors.description}</div>}
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
            {errors?.isFree && <div className="d-block text-danger small mt-1">{errors.isFree}</div>}
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