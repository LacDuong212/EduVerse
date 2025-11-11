import { useState, useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';


const Step4 = ({
  stepperInstance,
  draftData,
  onSave,
  onSubmit,
  isSubmitting,
}) => {
  const [tagsInput, setTagsInput] = useState(draftData.tags?.join(', ') || '');

  // update draft data
  useEffect(() => {
    // parse the tags string into an array
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase()) // clean and lowercase
      .filter((t) => t.length > 0) // remove empty tags
      .slice(0, 14); // limit to 14 tags

    onSave({ tags });
  }, [tagsInput, onSave]);

  // nav
  const goToPreviousStep = (e) => {
    e.preventDefault();
    stepperInstance?.previous();
  };

  // final submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isSubmitting) return; // prevent multiple submissions

    const confirmSubmit = window.confirm(
      'Once you submit, the draft data on this page will be cleared and cannot be recovered. Do you want to continue?'
    );
    if (!confirmSubmit) {
      toast.info('Submission cancelled');
      return;
    }

    // call the parent's submission function
    onSubmit();
  };

  return (
    <form
      id="step-4"
      role="tabpanel"
      className="content fade"
      aria-labelledby="steppertrigger4"
      onSubmit={handleSubmit}
      onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
    >
      <h4>Additional Information (Optional)</h4>
      <hr />

      <Row className="g-4">
        <Col xs={12}>
          <div className="bg-light border rounded p-4">
            <h5 className="mb-0">Tags</h5>
            <div className="mt-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter tags separated by commas"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                maxLength={200}
              />
              <span className="small mx-1">
                Maximum of 14 keywords, should all be in lowercase, separated by
                commas(,). For example:{' '}
                <span className="fw-bold">eduverse, course, online</span>
              </span>
            </div>
          </div>
        </Col>
      </Row>

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start mt-4">
        {/* Previous Button */}
        <div className="d-flex mb-1 mb-sm-0">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={goToPreviousStep}
          >
            Previous
          </button>
        </div>

        {/* Action Buttons */}
        <div className="d-flex flex-column align-items-end">
          <div className="d-flex gap-2">
            {/* Preview Button */}
            <Link
              to="/instructor/course-preview"
              state={{ courseData: draftData }} // pass draft data to preview route
              className="btn btn-light"
              target="_blank" // open in new tab
              rel="noopener noreferrer"
            >
              Preview Course
            </Link>
            
            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-success"
              disabled={isSubmitting} // controlled by parent
            >
              {isSubmitting ? 'Submitting…' : 'Create Course'}
            </button>
          </div>
          <p className="small mb-0 text-end mt-1">
            Once you click "Create Course", your course will be uploaded and
            marked as pending for review.
          </p>
        </div>
      </div>
    </form>
  );
};

export default Step4;
