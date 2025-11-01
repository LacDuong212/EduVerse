import { useState, useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import useCourseFormData from '../useCourseFormData';

const Step4 = ({ stepperInstance }) => {
  const { formData, setFormData, clearDraft, courseId } = useCourseFormData();
  const [submitting, setSubmitting] = useState(false);
  const [tagsInput, setTagsInput] = useState(formData.tags?.join(', ') || '');

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    // Keep formData updated with tags in real time if needed
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0)
      .slice(0, 14);

    setFormData((prev) => ({ ...prev, tags }));
  }, [tagsInput, setFormData]);

  const goToPreviousStep = (e) => {
    e.preventDefault();
    stepperInstance?.previous();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    // Warning confirmation before submit
    const confirmSubmit = window.confirm(
      'Once you submit, the draft data on this page will be cleared and cannot be recovered. Do you want to continue?'
    );
    if (!confirmSubmit) {
      toast.info('Submission cancelled');
      return;
    }

    setSubmitting(true);

    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0)
        .slice(0, 14);

      const finalData = {
        ...formData,
        tags,
        courseId,
      };

      const { data: res } = await axios.post(
        `${backendUrl}/api/courses/submit`,
        finalData,
        { withCredentials: true }
      );

      if (!res.success) throw new Error(res.message || 'Submission failed');

      toast.success('Course submitted for review!');

      clearDraft();
      setTagsInput('');

    } catch (err) {
      console.error(err);
      toast.error('Failed to submit course');
    } finally {
      setSubmitting(false);
    }
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
      <h4>Additional information</h4>
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
                maxLength={100} // optional max length for input string
              />
              <span className="small">
                Maximum of 14 keywords. Keywords should all be in lowercase. e.g. javascript, react, marketing
              </span>
            </div>
          </div>
        </Col>
      </Row>

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start mt-4">
        <div className="d-flex mb-1 mb-sm-0">
          <button type="button" className="btn btn-secondary" onClick={goToPreviousStep}>
            Previous
          </button>
        </div>

        <div className="d-flex flex-column align-items-end">
          <div className="d-flex gap-2">
            <Link to="/instructor/course-preview" className="btn btn-light">
              Preview Course
            </Link>
            <button type="submit" className="btn btn-success" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Create Course'}
            </button>
          </div>
          <p className="small mb-0 text-end mt-1">
            Once you click "Create Course", your course will be uploaded and marked as pending for review.
          </p>
        </div>
      </div>
    </form>
  );
};

export default Step4;
