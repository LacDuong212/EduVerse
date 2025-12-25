import ChoicesFormInput from '@/components/form/ChoicesFormInput';
import { currency } from '@/context/constants';
import { useEffect, useState } from 'react';
import { Button, Col, Row, Form, InputGroup } from 'react-bootstrap';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { toast } from 'react-toastify';

import { getAllCategories } from '@/helpers/data';


// react-quill settings ---
const QUILL_MODULES = {
  toolbar: [
    // header (1-6) + normal text (false)
    [{ "header": [1, 2, 3, 4, 5, 6, false] }],
    // font styles
    ["bold", "italic", "underline", "strike"],
    // lists & indents
    [{ "list": "ordered" }, { "list": "bullet" }],
    [{ "indent": "-1" }, { "indent": "+1" }],
    // text alignment
    [{ "align": [] }],
    // links
    ["link"],
    // color pickers
    [{ "color": [] }, { "background": [] }],
    // clean formatting
    ["clean"]
  ],
};
// define supported formats (good for security/cleanup)
const QUILL_FORMATS = [
  "header",
  "bold", "italic", "underline", "strike",
  "list", "indent",
  "link",
  "align", "color", "background",
];

const Step1 = ({ stepperInstance, draftData, onSave }) => {
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [categories, setCategories] = useState([]);

  // helpers: format/parse numbers with thousand separators
  const formatNumber = (n) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);
  const parseInputNumber = (s) => {
    if (typeof s === 'number') return s;
    const digits = String(s || '').replace(/[^0-9.-]/g, '');
    if (digits === '') return NaN;
    return Number(digits);
  };
  const toFormattedString = (v) => {
    if (v === 0) return '0';
    if (v === null || v === undefined || v === '') return '';
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v);
    return formatNumber(n);
  };

  // initialize from props or set defaults
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    category: '',
    subcategory: '',
    level: '',
    language: '',
    duration: '',
    durationUnit: 'hour',
    price: '',
    discountPrice: '',
    enableDiscount: false,
    description: '',
    isPrivate: true,
  });

  const draftDataString = JSON.stringify(draftData);

  // hydrate local form state when draftData prop changes
  useEffect(() => {
    setFormData({
      title: draftData.title || '',
      subtitle: draftData.subtitle || '',
      category: draftData.category || '',
      subcategory: draftData.subcategory || '',
      level: draftData.level || '',
      language: draftData.language || '',
      duration: draftData.duration || '',
      durationUnit: draftData.durationUnit || 'hour',
      price: toFormattedString(draftData.price === 0 ? 0 : draftData.price),
      discountPrice: toFormattedString(draftData.discountPrice || ''),
      enableDiscount: draftData.enableDiscount || false,
      description: draftData.description || '',
      isPrivate: draftData.isPrivate !== undefined ? draftData.isPrivate : true,
    });
  }, [draftDataString]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories();
        if (response && response.success) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
        toast.error("Could not load categories");
      }
    };

    fetchCategories();
  }, []);

  // handle input changes
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;

    // format numeric currency-like inputs with thousand separators
    if (name === 'price' || name === 'discountPrice') {
      // allow empty
      const stripped = String(value || '').replace(/[^0-9.-]/g, '');
      const formatted = stripped === '' ? '' : formatNumber(Number(stripped));
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }

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
    const price = parseInputNumber(formData.price);

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

    if (isNaN(price)) {
      newErrors.price = 'Price is required.';
    } else if (price < 0) {
      newErrors.price = 'Price must be a valid, positive number.';
    }

    if (formData.enableDiscount) {
      const discountPrice = parseInputNumber(formData.discountPrice);

      if (isNaN(discountPrice)) {
        newErrors.discountPrice = 'Discount price is required when enabled.';
      } else if (discountPrice <= 0) {
        newErrors.discountPrice = 'Discount must be a valid, positive number.';
      } else if (!newErrors.price && discountPrice >= price) {
        newErrors.discountPrice = 'Discount price must be less than the regular price.';
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
      // convert formatted strings to numbers before saving
      const payload = {
        ...formData,
        price: parseInputNumber(formData.price),
        discountPrice: formData.discountPrice ? parseInputNumber(formData.discountPrice) : undefined
      };

      onSave(payload);
      stepperInstance?.next();

      // inform progress saved
      toast.success('Step 1 saved!');
    } else {
      toast.error('Please check all error fields in step 1.');
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
            maxLength={84}
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
            name="subtitle"
            placeholder="Enter short description"
            value={formData.subtitle}
            maxLength={240}
            onChange={handleChange}
          />
        </Col>

        <Col md={6}>
          <Form.Group controlId="categorySelect">
            <Form.Label>Category <span className="text-danger">*</span></Form.Label>
            <ChoicesFormInput
              key={categories.length}

              className={!!errors.category ? 'is-invalid' : ''}
              value={formData.category}
              onChange={(val) =>
                handleCustomChange('category', val?.target?.value || val)
              }
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </ChoicesFormInput>

            <Form.Control.Feedback type="invalid" className="d-block">
              {errors.category}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        {/* <Col md={6}>
          <Form.Label>Subcategory</Form.Label>
          <ChoicesFormInput
            value={formData.subcategory}
            onChange={(val) =>
              handleCustomChange('subcategory', val?.target?.value || val)
            }
          >
            <option value="">Select course subcategory</option>
          </ChoicesFormInput>
        </Col> */}

        {/* force new row */}
        <Col md={6} ></Col>

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
        <Col md={6} ></Col>

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
              maxLength={12}
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
              name="discountPrice"
              placeholder="Enter discount"
              value={formData.discountPrice}
              maxLength={12}
              onChange={handleChange}
              disabled={!formData.enableDiscount}
              isInvalid={!!errors.discountPrice}
            />
            <span className="input-group-text rounded-end">{currency}</span>
            <Form.Control.Feedback type="invalid">
              {errors.discountPrice}
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
              modules={QUILL_MODULES}
              formats={QUILL_FORMATS}
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
            label="Make this course private"
            name="isPrivate"
            checked={formData.isPrivate}
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
