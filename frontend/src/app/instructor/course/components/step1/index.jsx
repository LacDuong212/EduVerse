import { Col, Row, Form, InputGroup, Spinner } from "react-bootstrap";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import ChoicesFormInput from "@/components/form/ChoicesFormInput";
import { currency } from "@/contexts/constants";
import { FormField } from "../FormField";
import useStep1 from "./useStep1";

const QUILL_CONFIG = {
  modules: {
    toolbar: [
      [{ "header": [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ "list": "ordered" }, { "list": "bullet" }],
      [{ "indent": "-1" }, { "indent": "+1" }],
      [{ "align": [] }],
      ["link"],
      [{ "color": [] }, { "background": [] }],
      ["clean"]
    ],
  },
  formats: ["header", "bold", "italic", "underline", "strike", "list", "indent", "link", "align", "color", "background"]
};

const MAX_LENGTH = {
  title: 96,
  subtitle: 240,
  price: 12,
  discountPrice: 12,
};

const toTitleCase = (str) => {
  if (!str) return "";
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

const Step1 = ({ stepperInstance, activeStep }) => {
  const {
    categories,
    languages,
    levels,
    optionLoading,
    formData,
    errors,
    handleChange,
    handleCustomChange,
    handleSubmit
  } = useStep1(stepperInstance);

  return (
    <Form
      id="step-1"
      role="tabpanel"
      className="bs-stepper-pane fade"
      aria-labelledby="steppertrigger1"
      onSubmit={handleSubmit}
      noValidate
    >
      {optionLoading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: "30px", height: "30px" }}
          />
        </div>
      ) : (
        <Row className="g-4">
          <Col xs={12}>
            <FormField label={"Title"} required={true} error={errors.title}>
              <Form.Control
                type="text"
                name="title"
                placeholder="Enter course title"
                maxLength={MAX_LENGTH.title}
                value={formData?.title}
                onChange={handleChange}
                isInvalid={!!errors.title}
              />
            </FormField>
          </Col>

          <Col xs={12}>
            <FormField label={"Short Description (Subtitle)"} required={false}>
              <Form.Control
                as="textarea"
                rows={3}
                name="subtitle"
                placeholder="Enter short description"
                maxLength={MAX_LENGTH.subtitle}
                value={formData?.subtitle}
                onChange={handleChange}
              />
            </FormField>
          </Col>

          <Col md={6}>
            <FormField controlId="categorySelect" label="Category" required={true} error={errors.categoryId}>
              <ChoicesFormInput
                name="categoryId"
                value={formData?.categoryId}
                onChange={handleChange}
                isInvalid
                error={errors.categoryId}
              >
                {categories?.length > 0 ? (
                  <>
                    <option value="">Select category</option>
                    {categories.map(cat => <option key={cat.cateId} value={cat.cateId}>{cat.cateName}</option>)}
                  </>
                ) : (
                  <option value={null}>No categories available</option>
                )}
              </ChoicesFormInput>
            </FormField>
          </Col>

          <Col md={6} >{/* Blank */}</Col>

          <Col md={6}>
            <FormField controlId="levelSelect" label="Level" required={true} error={errors.level}>
              <ChoicesFormInput
                name="level"
                value={formData?.level}
                onChange={handleChange}
                isInvalid
                error={errors.level}
              >
                {levels?.length > 0 ? (
                  <>
                    <option value="">Select course level</option>
                    {levels.map((lvl, idx) => <option key={idx} value={lvl}>{toTitleCase(lvl)}</option>)}
                  </>
                ) : (
                  <option value={null}>No levels available</option>
                )}
              </ChoicesFormInput>
            </FormField>
          </Col>

          <Col md={6}>
            <FormField controlId="languageSelect" label="Language" required={true} error={errors.language}>
              <ChoicesFormInput
                name="language"
                value={formData?.language}
                onChange={handleChange}
                isInvalid
                error={errors.language}
              >
                {languages?.length > 0 ? (
                  <>
                    <option value="">Select course language</option>
                    {languages.map((lang, idx) => <option key={idx} value={lang}>{toTitleCase(lang)}</option>)}
                  </>
                ) : (
                  <option value={null}>No languages available</option>
                )}
              </ChoicesFormInput>
            </FormField>
          </Col>

          <Col md={6}>
            <FormField label="Price" required={true} error={errors.price}>
              <InputGroup>
                <Form.Control name="price" placeholder="Enter price" value={formData?.price} onChange={handleChange} isInvalid={!!errors.price} />
                <InputGroup.Text>{currency}</InputGroup.Text>
              </InputGroup>
            </FormField>
          </Col>

          <Col md={6}>
            <FormField label="Discount Price" error={errors.discountPrice}>
              <InputGroup>
                <Form.Control
                  name="discountPrice"
                  placeholder="Enter discount price"
                  value={formData?.discountPrice}
                  onChange={handleChange}
                  disabled={!formData?.enableDiscount || false}
                  isInvalid={!!errors.discountPrice}
                />
                <InputGroup.Text>{currency}</InputGroup.Text>
              </InputGroup>
              <Form.Check
                type="checkbox" id="enableDiscountCheck" label="Enable discount" name="enableDiscount"
                className="mt-2 small" checked={formData?.enableDiscount || false} onChange={handleChange}
              />
            </FormField>
          </Col>

          <Col xs={12}>
            <Form.Label>Description</Form.Label>
            <div className="mb-3 pb-5 pb-md-4">
              <ReactQuill
                theme="snow"
                value={formData?.description}
                onChange={(val) => handleCustomChange("description", val)}
                {...QUILL_CONFIG}
                style={{ height: 400 }}
              />
            </div>
          </Col>

          {/* <Col xs={12}>
            <Form.Check type="switch" id="isPrivateSwitch" label="Make course private" name="isPrivate" defaultValue={true} checked={formData?.isPrivate} onChange={handleChange} />
          </Col> */}

          <Col xs={12} className="text-end">
            <button className="btn btn-primary mb-0" type="submit">
              Next
            </button>
          </Col>
        </Row>
      )}
    </Form>
  );
};

export default Step1;