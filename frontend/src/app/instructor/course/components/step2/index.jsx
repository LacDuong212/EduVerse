import { useEffect, useRef } from "react";
import { Alert, Col, Nav, ProgressBar, Row, Spinner, Tab } from "react-bootstrap";
import { FaTrash, FaVideo } from "react-icons/fa";
import galleryImg from "@/assets/images/element/gallery.svg";
import { useStep2 } from "./useStep2";

const Step2 = ({ stepperInstance, activeStep }) => {
  const { state, previews, refs, dropzone, methods } = useStep2(stepperInstance);

  const videoRef = useRef(null);

  useEffect(() => {
    if (activeStep !== 2 && videoRef.current) {
      videoRef.current.pause();
    }
  }, [activeStep]);

  return (
    <form
      id="step-2"
      role="tabpanel"
      onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
      className="bs-stepper-pane fade"
      aria-labelledby="steppertrigger2"
      onSubmit={methods.handleSubmit}
    >
      <Row>
        {/* IMAGE SECTION */}
        <Col xs={12}>
          <h5 className="mb-0">Course Image <span className="text-danger">*</span></h5>
          <Tab.Container
            activeKey={state.imageState.tab}
            onSelect={(t) => methods.setImageState(p => ({ ...p, tab: t }))}
          >
            <Nav variant="tabs" className="nav-tabs-line mt-3">
              <Nav.Item><Nav.Link eventKey="upload">Upload Image</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="url">Image URL</Nav.Link></Nav.Item>
            </Nav>

            <Tab.Content className="pt-3">
              <Tab.Pane eventKey="upload">
                <div
                  {...dropzone.getRootProps()}
                  className={`text-center p-4 border border-2 border-dashed rounded-3 ${state.errors?.image ? "border-danger bg-light-danger" :
                    dropzone.isDragActive ? "border-primary bg-light" : ""
                    }`}
                  style={{ cursor: "pointer" }}
                >
                  <input {...dropzone.getInputProps()} />

                  {state.isImgLoading ? (
                    <div className="text-primary">
                      <div className="spinner-border" />
                      <p>Uploading...</p>
                    </div>
                  ) : (
                    <>
                      {dropzone.isDragActive ? (
                        <h6 className="my-2">Drop it like it's hot!</h6>
                      ) : (
                        <h6 className="my-2">Drop an image here, or <span className="text-primary">Browse</span></h6>
                      )}
                      <p className="small mb-0 mt-2">
                        <b>Note:</b> Only JPG, JPEG and PNG. Suggested size
                        600×450px. Maxium file size is 5MB.
                      </p>
                    </>
                  )}
                </div>
                {state.errors?.image && <div className="text-danger small mt-2">{state.errors.image}</div>}
              </Tab.Pane>
              <Tab.Pane eventKey="url">
                <input
                  type="url"
                  className={`form-control ${state.errors?.image ? "is-invalid" : ""}`}
                  placeholder="Paste image URL here..."
                  value={state.imageState.url || ""}
                  onChange={(e) => methods.setImageState(p => ({ ...p, url: e.target.value, file: null }))}
                />
                {state.errors?.image && <div className="invalid-feedback">{state.errors.image}</div>}
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>

          {/* Image Preview */}
          <div className="mt-3 text-center">
            {previews.previewImage && !state.isImgLoading ? (
              <>
                <img src={previews.previewImage} className="img-fluid rounded-3 border" alt="Preview" style={{ maxHeight: "300px" }} />
                <div className="mt-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-danger-soft"
                    onClick={() => methods.handleRemoveMedia("image")}
                  >
                    Remove
                  </button>
                </div>
              </>
            ) : !state.isImgLoading ? (
              <div className="border border-dashed rounded-3">
                {/* <img src={galleryImg} style={{ maxHeight: "100px" }} className="m-3" alt="placeholder" /> */}
              </div>
            ) : (
              <div className="placeholder-glow"><div className="placeholder rounded shadow-sm" style={{ width: "100%", height: "200px" }}></div></div>
            )}
          </div>
        </Col>

        {/* VIDEO SECTION */}
        <Col xs={12} className="mt-4">
          <h5 className="mb-0">Course Preview Video</h5>
          <p className="small">Upload a short preview to engage students. Accepts only MP4, MOV, or OGG. Max size: 2GB.</p>

          <div className="mb-3">
            <input
              ref={refs.videoInputRef}
              type="file"
              className={`form-control ${state.errors?.previewVideo ? "is-invalid" : ""}`}
              accept="video/mp4,video/webm,video/ogg,.mp4,.webm,.ogv,.ogg"
              disabled={state.isVidLoading}
              onChange={methods.handleVideoFileChange}
            />
            {state.errors?.previewVideo && <div className="invalid-feedback">{state.errors.previewVideo}</div>}
          </div>

          {state.isVidLoading && (
            <div className="mt-3 p-3 border rounded">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-primary h6 mb-0">Uploading Video...</span>
                <span className="text-primary fw-bold">{state.vidProgress}%</span>
              </div>
              <ProgressBar now={state.vidProgress} animated variant="primary" style={{ height: "10px" }} />
            </div>
          )}

          {/* Video Player Area */}
          {(state.videoState.file || (state.isS3Reference && !state.videoState.file)) && !state.isVidLoading && (
            <div className="bg-dark rounded-3 overflow-hidden shadow-lg mt-3">
              <div className="px-3 py-2 text-white small d-flex justify-content-between align-items-center">
                <span>
                  <FaVideo className="mb-1 me-2" />
                  {state.videoState.file ? `Local Preview: ${state.videoState.file.name}` : "Saved Preview Video"}
                </span>
                <button
                  type="button"
                  title="Remove Video"
                  className="btn btn-link text-danger p-0 border-0"
                  onClick={() => methods.handleRemoveMedia("video")}
                >
                  <FaTrash />
                </button>
              </div>

              {state.videoState.file ? (
                <video
                  ref={videoRef}
                  key={previews.videoObjectUrl}
                  controls
                  width="100%"
                  className="d-block w-100"
                  src={previews.videoObjectUrl}
                  style={{ maxHeight: "400px" }}
                />
              ) : state.streamLoading ? (
                <div className="d-flex align-items-center justify-content-center p-5 text-light">
                  <Spinner animation="border" />
                </div>
              ) : (
                <video
                  ref={videoRef}
                  controls
                  controlsList="nodownload"
                  width="100%"
                  className="d-block"
                  src={previews.s3StreamUrl}
                  style={{ maxHeight: "350px" }}
                />
              )}
            </div>
          )}
        </Col>

        {/* STEPPER NAVIGATION */}
        <Col xs={12} className="d-flex justify-content-between mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary mb-0"
            onClick={() => stepperInstance?.previous()}
            disabled={state.isBusy}
          >
            Previous
          </button>
          <button
            type="submit"
            className="btn btn-primary mb-0"
            disabled={state.isBusy}
          >
            {state.isBusy ? (
              <><Spinner animation="border" size="sm" className="me-2" /> Saving...</>
            ) : "Next"}
          </button>
        </Col>
      </Row>
    </form>
  );
};

export default Step2;