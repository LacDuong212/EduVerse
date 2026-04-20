import { Col, Row } from "react-bootstrap";
import { useStep4 } from "./useStep4";

const Step4 = ({ stepperInstance }) => {
  const { state, handlers } = useStep4(stepperInstance);

  return (
    <form
      id="step-4"
      role="tabpanel"
      className="content fade"
      aria-labelledby="steppertrigger4"
      onSubmit={handlers.handleSubmit}
      onKeyDown={(e) => e.key === "Enter" && e.preventDefault()} // prevent accidental submit on Enter
    >
      <h4>Additional Information (Optional)</h4>
      <hr />

      <Row className="g-4">
        <Col xs={12}>
          <div className="bg-light border rounded p-4">
            <h5 className="mb-0">
              Tags <span>({state.tagsInput?.split(',').filter(t => t.trim()).length} / 14)</span>
            </h5>
            <div className="mt-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter tags separated by commas..."
                value={state.tagsInput}
                onChange={handlers.handleTagsChange}
                maxLength={200}
              />
            </div>
            <div className="small mx-1 mt-1">
              Max 14 keywords. Lowercase only. Separate with commas. Example: <span className="fw-bold">javascript, react, web development</span>
            </div>
          </div>
        </Col>
      </Row>

      {/* Navigation Footer */}
      <div className="d-flex justify-content-between align-items-start mt-4">

        {/* Previous Button */}
        <button
          type="button"
          className="btn btn-outline-secondary mb-0"
          onClick={handlers.goBack}
          disabled={state.isSubmitting}
        >
          Previous
        </button>

        {/* Action Buttons */}
        <div className="d-flex flex-column align-items-end">
          {/* Preview */}

          <div className="d-flex gap-2">
            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-success mb-0"
              disabled={state.isSubmitting}
            >
              {state.isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting...
                </>
              ) : (
                "Submit Course"
              )}
            </button>
          </div>

          <p className="small mb-0 text-end text-info mt-2">
            <i className="bi bi-info-circle me-1"></i>
            Your course will be reviewed before going live.
          </p>
        </div>
      </div>
    </form>
  );
};

export default Step4;