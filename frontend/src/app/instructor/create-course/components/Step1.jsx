import ChoicesFormInput from '@/components/form/ChoicesFormInput';
import { currency } from '@/context/constants';
import { useEffect, useState } from 'react';
import { Button, Col, Row, Form, InputGroup } from 'react-bootstrap';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { toast } from 'react-toastify';


const Step1 = ({ stepperInstance, draftData, onSave }) => {
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // initialize from props or set defaults
  const [formData, setFormData] = useState({
    title: '',
    subTitle: '',
    category: '',
    subcategory: '',
    level: '',
    language: '',
    featured: false,
    duration: '',
    durationUnit: 'hours',
    price: '',
    discount: '',
    enableDiscount: false,
    description: '',
    isActive: false,
  });

  const draftDataString = JSON.stringify(draftData);

  // hydrate local form state when draftData prop changes
  useEffect(() => {
    setFormData({
      title: draftData.title || '',
      subTitle: draftData.subTitle || '',
      category: draftData.category || '',
      subcategory: draftData.subcategory || '',
      level: draftData.level || '',
      language: draftData.language || '',
      featured: draftData.featured || false,
      duration: draftData.duration || '',
      durationUnit: draftData.durationUnit || 'hours',
      price: draftData.price || '',
      discount: draftData.discount || '',
      enableDiscount: draftData.enableDiscount || false,
      description: draftData.description || '',
      isActive: draftData.isActive !== undefined ? draftData.isActive : false, // = isPublish
    });
  }, [draftDataString]);

  // handle input changes
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // clear the specific error when the user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // special handler for custom fields
  const handleCustomChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // validation
  const validateForm = () => {
    const newErrors = {};
    const price = Number(formData.price);

    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = 'Course title is required.';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category.';
    }

    if (!formData.level) {
      newErrors.level = 'Please select a course level.';
    }

    if (!formData.language) {
      newErrors.language = 'Please select a language.';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required.';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      newErrors.price = 'Price must be a valid, positive number.';
    }

    if (formData.enableDiscount) {
      const discount = Number(formData.discount);

      if (!formData.discount) {
        newErrors.discount = 'Discount price is required when enabled.';
      } else if (isNaN(discount) || discount <= 0) {
        newErrors.discount = 'Discount must be a valid, positive number.';
      } else if (!newErrors.price && discount >= price) {
        newErrors.discount = 'Discount price must be less than the regular price.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // return true if there are no errors
  };

  // handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);

    // run validation
    if (validateForm()) {
      onSave(formData);
      stepperInstance?.next();

      // inform progress saved
      toast.success('Step 1 saved!');
    } else {
      toast.error('Please fix the errors on the page');
    }

    setSaving(false);
  };

  return (
    <Form
      id="step-1"
      role="tabpanel"
      className="bs-stepper-pane fade"
      aria-labelledby="steppertrigger1"
      onSubmit={handleSubmit}
      noValidate  // disable native browser validation
    >
      <h4>Course Details</h4>
      <hr />

      <Row className="g-4">
        <Col xs={12}>
          <Form.Label>Course Title <span className="text-danger">*</span></Form.Label>
          <Form.Control
            type="text"
            name="title"
            placeholder="Enter course title"
            value={formData.title}
            onChange={handleChange}
            isInvalid={!!errors.title}
          />
          <Form.Control.Feedback type="invalid">
            {errors.title}
          </Form.Control.Feedback>
        </Col>

        <Col xs={12}>
          <Form.Label>Short Description (Subtitle)</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            name="subTitle"
            placeholder="Enter short description"
            value={formData.subTitle}
            onChange={handleChange}
          />
        </Col>

        <Col md={6}>
          <Form.Group controlId="categorySelect">
            <Form.Label>Category <span className="text-danger">*</span></Form.Label>
            <ChoicesFormInput
              className={!!errors.category ? 'is-invalid' : ''}
              value={formData.category}
              onChange={(val) =>
                handleCustomChange('category', val?.target?.value || val)
              }
            >
              <option value="">Select category</option>
              <option value="Engineer">Engineer</option>
              <option value="Medical">Medical</option>
              <option value="Information technology">Information technology</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
            </ChoicesFormInput>
            <Form.Control.Feedback type="invalid" className="d-block">
              {errors.category}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Label>Subcategory</Form.Label>
          <ChoicesFormInput
            value={formData.subcategory}
            onChange={(val) =>
              handleCustomChange('subcategory', val?.target?.value || val)
            }
          >
            <option value="">Select course subcategory</option>
          </ChoicesFormInput>
        </Col>

        <Col md={6}>
          <Form.Group controlId="levelSelect">
            <Form.Label>Course Level <span className="text-danger">*</span></Form.Label>
            <ChoicesFormInput
              className={!!errors.level ? 'is-invalid' : ''}
              value={formData.level}
              onChange={(val) =>
                handleCustomChange('level', val?.target?.value || val)
              }
            >
              <option value="">Select course level</option>
              <option value="All">All</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </ChoicesFormInput>
            <Form.Control.Feedback type="invalid" className="d-block">
              {errors.level}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group controlId="languageSelect">
            <Form.Label>Language <span className="text-danger">*</span></Form.Label>
            <ChoicesFormInput
              className={!!errors.language ? 'is-invalid' : ''}
              value={formData.language}
              onChange={(val) =>
                handleCustomChange('language', val?.target?.value || val)
              }
            >
              <option value="">Select language</option>
              <option>English</option>
              <option>Vietnamese</option>
              <option>Others</option>
            </ChoicesFormInput>
            <Form.Control.Feedback type="invalid" className="d-block">
              {errors.language}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Label>Course Duration</Form.Label>
          <InputGroup>
            <Form.Control
              type="number"
              name="duration"
              placeholder="Enter duration"
              min="1"
              value={formData.duration}
              onChange={handleChange}
              style={{ width: '60%' }} // wider input
            />
            <Form.Select
              name="durationUnit"
              value={formData.durationUnit}
              onChange={handleChange}
              style={{ width: '40%' }} // narrower select
            >
              <option value="hour">Hours</option>
              <option value="minute">Minutes</option>
              <option value="second">Seconds</option>
              <option value="day">Days</option>
            </Form.Select>
          </InputGroup>
        </Col>

        {/* force new row */}
        <Col md={4} ></Col>

        <Col md={6}>
          <Form.Label>
            Price <span className="text-danger">*</span>
          </Form.Label>
          <div className="input-group">
            <Form.Control
              type="text"
              name="price"
              placeholder="Enter price"
              value={formData.price}
              onChange={handleChange}
              isInvalid={!!errors.price}
            />
            <span className="input-group-text rounded-end">{currency}</span>
            <Form.Control.Feedback type="invalid">
              {errors.price}
            </Form.Control.Feedback>
          </div>
        </Col>

        <Col md={6}>
          <Form.Label>Discount Price</Form.Label>
          <div className="input-group">
            <Form.Control
              type="text"
              name="discount"
              placeholder="Enter discount"
              value={formData.discount}
              onChange={handleChange}
              disabled={!formData.enableDiscount}
              isInvalid={!!errors.discount}
            />
            <span className="input-group-text rounded-end">{currency}</span>
            <Form.Control.Feedback type="invalid">
              {errors.discount}
            </Form.Control.Feedback>
          </div>
          <Form.Check
            type="checkbox"
            id="checkBox1"
            label="Enable discount"
            className="small mt-2"
            name="enableDiscount"
            checked={formData.enableDiscount}
            onChange={handleChange}
          />
        </Col>

        <Col xs={12}>
          <Form.Label>Add Description</Form.Label>
          <div className='pb-3'>
            <ReactQuill
              theme="snow"
              style={{ height: 400 }}
              value={formData.description}
              onChange={(val) =>
                handleCustomChange('description', val)
              }
            />
          </div>
        </Col>

        <Col md={6} className="mt-5">
          <Form.Check
            type="switch"
            id="checkPrivacy1"
            label="Publish this course once approved"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
          />
        </Col>

        <div className="d-flex justify-content-end mt-3">
          <Button
            type="submit"
            variant="primary"
            className="next-btn mb-0"
            disabled={saving}
          >
            {saving ? 'Validating...' : 'Next'}
          </Button>
        </div>
      </Row>
    </Form>
  );
};

export default Step1;
