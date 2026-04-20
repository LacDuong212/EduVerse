import { Alert, Col, Nav, ProgressBar, Row, Spinner, Tab } from "react-bootstrap";
import { FaTrash, FaVideo } from "react-icons/fa";
import galleryImg from "@/assets/images/element/gallery.svg";
import { useStep2 } from "./useStep2";

const Step2 = ({ stepperInstance }) => {
  const { state, previews, refs, dropzone, methods } = useStep2(stepperInstance);

  return (
    <form
      id="step-2"
      role="tabpanel"
      onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
      className="content fade"
      aria-labelledby="steppertrigger2"
      onSubmit={methods.handleSubmit}
    >
      <h4>Course Media <span className="text-danger">*</span></h4>
      {state.error && <Alert variant="danger">{state.error}</Alert>}
      <hr />

      <Row>
        {/* IMAGE SECTION */}
        <Col xs={12}>
          <h5>Course Image <span className="text-danger">*</span></h5>
          <Tab.Container
            activeKey={state.imageState.tab}
            onSelect={(t) => methods.setImageState(p => ({ ...p, tab: t }))}
          >
            <Nav variant="tabs" className="nav-tabs-line mt-3">
              <Nav.Item><Nav.Link eventKey="url">Image URL</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="upload">Upload Image</Nav.Link></Nav.Item>
            </Nav>

            <Tab.Content className="pt-3">
              <Tab.Pane eventKey="url">
                <input
                  type="url"
                  className={`form-control ${state.fieldErrors?.image ? "is-invalid" : ''}`}
                  placeholder="eg. https://..."
                  value={state.imageState.url}
                  onChange={(e) => methods.setImageState(p => ({ ...p, url: e.target.value, file: null }))}
                />
                {state.fieldErrors?.image && <div className="invalid-feedback">{state.fieldErrors.image}</div>}
              </Tab.Pane>
              <Tab.Pane eventKey="upload">
                <div
                  {...dropzone.getRootProps()}
                  className={`text-center p-4 border border-2 border-dashed rounded-3 ${state.fieldErrors?.image ? "border-danger bg-light-danger" :
                    dropzone.isDragActive ? "border-primary bg-light" : ''
                    }`}
                  style={{ cursor: "pointer" }}
                >
                  <input {...dropzone.getInputProps()} />

                  {state.isImgLoading ? (
                    <div className="text-primary">
                      <div className="spinner-border mb-2" />
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
                {state.fieldErrors?.image && <div className="text-danger small mt-2">{state.fieldErrors.image}</div>}
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>

          {/* Image Preview */}
          <div className="mt-3 text-center">
            {previews.previewImage && !state.isImgLoading ? (
              <>
                <img src={previews.previewImage} className="img-fluid rounded-3 border" alt="Preview" style={{ maxHeight: "300px" }} />
                <div className="mt-2">
                  <button type="button" className="btn btn-sm btn-danger-soft" onClick={methods.handleRemoveImage}>Remove</button>
                </div>
              </>
            ) : !state.isImgLoading && (
              <div className="p-5 border border-dashed rounded-3">
                <img src={galleryImg} style={{ maxHeight: "100px" }} alt="placeholder" />
              </div>
            )}
          </div>
        </Col>

        {/* VIDEO SECTION */}
        <Col xs={12} className="mt-4">
          <h5 className="mb-0">Course Preview Video</h5>
          <p className="small">Provide a video ID (LEC format or legacy) or upload a file.</p>

          <div className="mb-3">
            <label className="form-label">Video ID / Key</label>
            <input
              className={`form-control ${state.fieldErrors?.videoId ? "is-invalid" : ''}`}
              type="text"
              value={state.videoState.videoId}
              onChange={(e) => methods.setVideoState({ videoId: e.target.value, file: null })}
              placeholder="eg. LECxxxx..."
            />
            {state.fieldErrors?.videoId && <div className="invalid-feedback">{state.fieldErrors.videoId}</div>}
          </div>

          <div className="position-relative my-3 px-3">
            <hr /><p className="small position-absolute top-50 start-50 translate-middle bg-body px-2">or</p>
          </div>

          <div>
            <input
              ref={refs.videoInputRef}
              type="file"
              className="form-control"
              accept="video/mp4, video/quicktime, video/x-msvideo, video/x-matroska, .mkv, .avi, .mov, .mp4"
              disabled={state.isVidLoading}
              onChange={methods.handleVideoFileChange}
            />
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
          <div>
            {/* S3 Streaming (Legacy or New) */}
            {state.isS3Reference && !state.videoState.file && (
              <div className="bg-dark rounded-3 overflow-hidden shadow mt-3">
                {state.streamLoading ? (
                  <div className="d-flex align-items-center justify-content-center p-5 text-white">
                    <Spinner animation="grow" size="sm" className="me-2" /> Loading Stream...
                  </div>
                ) : (
                  <video
                    controls
                    controlsList="nodownload"
                    width="100%"
                    className="d-block"
                    src={previews.s3StreamUrl}
                    style={{ maxHeight: "400px" }}
                  />
                )}
              </div>
            )}

            {/* Local File Preview */}
            {state.videoState.file && previews.videoObjectUrl && !state.isVidLoading && (
              <div className="bg-dark rounded-3 overflow-hidden shadow mt-3">
                <div className="p-2 bg-secondary text-white small d-flex justify-content-between align-items-center">
                  <span><FaVideo className="mb-1 me-2" /> Local Preview: {state.videoState.file.name}</span>
                  <button title="Remove" className="btn text-danger btn-sm mb-0 p-0" onClick={methods.handleRemoveVideo}><FaTrash /></button>
                </div>
                <video
                  controls
                  width="100%"
                  className="d-block"
                  src={previews.videoObjectUrl}
                  style={{ maxHeight: "400px" }}
                />
              </div>
            )}
          </div>
        </Col>

        {/* STEPPER NAVIGATION */}
        <Col xs={12} className="d-flex justify-content-between mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary border mb-0"
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