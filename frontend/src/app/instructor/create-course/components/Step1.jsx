import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ChoicesFormInput from '@/components/form/ChoicesFormInput';
import { toast } from 'react-toastify';
import useCourseFormData from '../useCourseFormData';

const Step1 = ({ stepperInstance }) => {
  const { formData: savedData, updateStepData } = useCourseFormData();

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subTitle: '',
    category: '',
    level: '',
    language: '',
    featured: false,
    duration: '',
    lecturesCount: '',
    price: '',
    discount: '',
    enableDiscount: false,
    description: '',
  });

  useEffect(() => {
    // only hydrate once — when component mounts and local formData is still empty
    if (
      savedData &&
      Object.keys(savedData).length > 0 &&
      !formData.title && // or another key check to avoid overwriting
      !formData.subTitle
    ) {
      setFormData((prev) => ({ ...prev, ...savedData }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run only once on mount

  // handle input changes
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateStepData('step1', formData);
      stepperInstance?.next();
    } catch {
      toast.error('Failed to save course details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      id="step-1"
      role="tabpanel"
      className="content fade"
      aria-labelledby="steppertrigger1"
      onSubmit={handleSubmit}
    >
      <h4>Course details</h4>
      <hr />

      <Row className="g-4">
        <Col xs={12}>
          <label className="form-label">Course title</label>
          <input
            className="form-control"
            type="text"
            name="title"
            placeholder="Enter course title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </Col>

        <Col xs={12}>
          <label className="form-label">Short description</label>
          <textarea
            className="form-control"
            rows={2}
            name="subTitle"
            placeholder="Enter short description"
            value={formData.subTitle}
            onChange={handleChange}
          />
        </Col>

        <Col md={6}>
          <label className="form-label">Course category</label>
          <ChoicesFormInput
            className="form-select js-choice border-0 z-index-9 bg-transparent"
            value={formData.category}
            onChange={(val) =>
              setFormData((p) => ({ ...p, category: val?.target?.value || val }))
            }
          >
            <option value="">Select category</option>
            <option value="Engineer">Engineer</option>
            <option value="Medical">Medical</option>
            <option value="Information technology">Information technology</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
          </ChoicesFormInput>
        </Col>

        <Col md={6}>
          <label className="form-label">Course level</label>
          <ChoicesFormInput
            className="form-select js-choice border-0 z-index-9 bg-transparent"
            value={formData.level}
            onChange={(val) =>
              setFormData((p) => ({ ...p, level: val?.target?.value || val }))
            }
          >
            <option value="">Select course level</option>
            <option value="All">All</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </ChoicesFormInput>
        </Col>

        <Col md={6}>
          <label className="form-label">Language</label>
          <ChoicesFormInput
            className="form-select js-choice border-0 z-index-9 bg-transparent"
            value={formData.language}
            onChange={(val) =>
              setFormData((p) => ({ ...p, language: val?.target?.value || val }))
            }
          >
            <option value="">Select language</option>
            <option>English</option>
            <option>Vietnamese</option>
          </ChoicesFormInput>
        </Col>

        <Col
          md={6}
          className="d-flex align-items-center justify-content-start mt-5"
        >
          <div className="form-check form-switch form-check-md">
            <input
              className="form-check-input"
              type="checkbox"
              id="checkPrivacy1"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="checkPrivacy1">
              Check this for featured course
            </label>
          </div>
        </Col>

        <Col md={6}>
          <label className="form-label">Course duration (hours)</label>
          <input
            className="form-control"
            type="text"
            name="duration"
            placeholder="Enter duration"
            value={formData.duration}
            onChange={handleChange}
          />
        </Col>

        <Col md={6}>
          <label className="form-label">Total lectures</label>
          <input
            className="form-control"
            type="text"
            name="lecturesCount"
            placeholder="Enter number of lectures"
            value={formData.lecturesCount}
            onChange={handleChange}
          />
        </Col>

        <Col md={6}>
          <label className="form-label">Course price</label>
          <input
            type="text"
            className="form-control"
            name="price"
            placeholder="Enter price"
            value={formData.price}
            onChange={handleChange}
          />
        </Col>

        <Col md={6}>
          <label className="form-label">Discount price</label>
          <input
            className="form-control"
            type="text"
            name="discount"
            placeholder="Enter discount"
            value={formData.discount}
            onChange={handleChange}
          />
          <Col xs={12} className="mt-1 mb-0">
            <div className="form-check small mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                id="checkBox1"
                name="enableDiscount"
                checked={formData.enableDiscount}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="checkBox1">
                Enable this discount
              </label>
            </div>
          </Col>
        </Col>

        <Col xs={12}>
          <label className="form-label">Add description</label>
          <ReactQuill
            className="pb-2 pb-sm-0 mb-4"
            theme="snow"
            style={{ height: 400 }}
            value={formData.description}
            onChange={(val) =>
              setFormData((p) => ({ ...p, description: val }))
            }
            id="quilltoolbar"
          />
        </Col>

        <div className="d-flex justify-content-end mt-5">
          <button
            type="submit"
            className="btn btn-primary next-btn mb-0"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Next'}
          </button>
        </div>
      </Row>
    </form>
  );
};

export default Step1;
