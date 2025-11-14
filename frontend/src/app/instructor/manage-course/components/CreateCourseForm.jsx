import PageMetaData from '@/components/PageMetaData';
import { CREATE_COURSE_DRAFT_STORAGE_KEY } from '@/context/constants';
import useBSStepper from '@/hooks/useBSStepper';

import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';

import axios from 'axios';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardBody, CardHeader, Col, Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


const CreateCourseForm = () => {
  const navigate = useNavigate();
  const stepperRef = useRef(null);
  const stepperInstance = useBSStepper(stepperRef);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // init
  const [courseDraft, setCourseDraft] = useState(() => {
    try {
      const storedDraft = sessionStorage.getItem(CREATE_COURSE_DRAFT_STORAGE_KEY);
      return storedDraft ? JSON.parse(storedDraft) : {};
    } catch (error) {
      console.error('Error parsing draft from sessionStorage', error);
      toast.error('Failed to restore previous draft');
      return {};
    }
  });

  // saving changes to draft
  useEffect(() => {
    sessionStorage.setItem(CREATE_COURSE_DRAFT_STORAGE_KEY, JSON.stringify(courseDraft));
  }, [courseDraft]);

  // init stepper
  useEffect(() => {
    stepperInstance?.to(1);
  }, [stepperInstance]);

  // warning when leaving site without submitting changes
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (hasMeaningfulDraftData(courseDraft)) {
        // these are required to trigger the browser's native prompt
        event.preventDefault();
        event.returnValue = ''; // necessary
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [courseDraft]);

  // data handler
  const handleSaveDraft = useCallback((stepData) => {
    setCourseDraft((prevDraft) => ({
      ...prevDraft,
      ...stepData,
    }));
  }, []);

  // helper
  const hasMeaningfulDraftData = (draft) => {
    // get all keys from draft
    const keys = Object.keys(draft);

    // nokeys = empty
    if (keys.length === 0) {
      return false;
    }

    // check if there is any key other than 'tags'
    const hasOtherData = keys.some(key => key !== 'tags');
    if (hasOtherData) {
      return true;
    }

    // only has 'tags' key, check if tags is empty
    if (draft.tags && draft.tags.length > 0) {
      return true;
    }

    return false;
  };

  // final validation
  const validateDraft = (draft) => {
    // step 1
    if (!draft.title?.trim()) return 'Title is required.';
    if (!draft.category?.trim()) return 'Category is required.';
    if (!draft.level?.trim()) return 'Level is required.';
    if (!draft.language?.trim()) return 'Language is required.';
    if (draft.price == null || draft.price < 0) {
      return 'A valid price is required.';
    }
    if (draft.enableDiscount && (draft.discountPrice == null || draft.discountPrice < 0)) {
      return 'Discount price is required when discount is enabled.';
    }
    if (draft.enableDiscount && draft.discountPrice >= draft.price) {
      return 'Discount price must be less than the original price.';
    }

    // step 2
    if (!draft.image?.trim()) return 'Course image is required.';

    // step 3
    if (!draft.curriculum || draft.curriculum.length === 0) {
      return 'Curriculum must have at least one section.';
    } else if (draft.curriculum.some(sec => sec.lectures.length === 0)) {
      return 'Each section must contain at least one lecture.';
    }

    // step 4?

    return null; // all good
  };

  // submit handler
  const handleSubmitCourse = async () => {
    console.log('Submitting final draft...', courseDraft);

    if (isSubmitting) return; // prevent double-submit

    // validation
    const validationError = validateDraft(courseDraft);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const confirmSubmit = window.confirm(
      'Once you submit, the draft data on this page will be cleared and cannot be recovered. Do you want to continue?'
    );
    if (!confirmSubmit) {
      toast.info('Submission cancelled');
      return;
    }

    setIsSubmitting(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const { data: res } = await axios.post(
        `${backendUrl}/api/courses`,
        courseDraft,
        { withCredentials: true }
      );

      // handle response
      if (res.success) {
        toast.success(res.message || 'Course submitted for review!');

        // clear the draft from storage and state
        sessionStorage.removeItem(CREATE_COURSE_DRAFT_STORAGE_KEY);

        // redirect
        navigate('/instructor/courses');
      } else {
        toast.error('Submission failed');
        throw new Error(res.message || 'Submission failed');
      }

    } catch (error) {
      console.error('Failed to submit course', error);
      toast.error(error.message || 'Failed to submit course');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageMetaData title="Create a Course" />
      <Container className="mt-3 mb-5">
        <Row>
          <Col md={8} className="mx-auto text-center">
            <p className="text-center">
              Add your new course here. After you submit it, our team will review it for quality.
              <br />
              Once it’s approved, your course will go live on the portal, and we’ll notify you by email.
            </p>  {/* #TODO: send email */}
          </Col>
        </Row>
        <Card className="bg-transparent border rounded-3 mb-5">
          <div id="stepper" ref={stepperRef} className="bs-stepper stepper-outline">
            <CardHeader className="bg-light border-bottom px-lg-5">
              <div className="bs-stepper-header" role="tablist">
                {/* --- Stepper Headers --- */}
                <div className="step" data-target="#step-1">
                  <div className="d-grid text-center align-items-center">
                    <button type="button" className="btn btn-link step-trigger mb-0" role="tab" id="steppertrigger1" aria-controls="step-1">
                      <span className="bs-stepper-circle">1</span>
                    </button>
                    <h6 className="bs-stepper-label d-none d-md-block">Course Details <span className="text-danger">*</span></h6>
                  </div>
                </div>
                <div className="line mt-5" />
                <div className="step" data-target="#step-2">
                  <div className="d-grid text-center align-items-center">
                    <button type="button" className="btn btn-link step-trigger mb-0" role="tab" id="steppertrigger2" aria-controls="step-2">
                      <span className="bs-stepper-circle">2</span>
                    </button>
                    <h6 className="bs-stepper-label d-none d-md-block">Course Media <span className="text-danger">*</span></h6>
                  </div>
                </div>
                <div className="line mt-5" />
                <div className="step" data-target="#step-3">
                  <div className="d-grid text-center align-items-center">
                    <button type="button" className="btn btn-link step-trigger mb-0" role="tab" id="steppertrigger3" aria-controls="step-3">
                      <span className="bs-stepper-circle">3</span>
                    </button>
                    <h6 className="bs-stepper-label d-none d-md-block">Curriculum <span className="text-danger">*</span></h6>
                  </div>
                </div>
                <div className="line mt-5" />
                <div className="step" data-target="#step-4">
                  <div className="d-grid text-center align-items-center">
                    <button type="button" className="btn btn-link step-trigger mb-0" role="tab" id="steppertrigger4" aria-controls="step-4">
                      <span className="bs-stepper-circle">4</span>
                    </button>
                    <h6 className="bs-stepper-label d-none d-md-block">Additional Information</h6>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="bs-stepper-content">
                <Step1
                  stepperInstance={stepperInstance}
                  draftData={courseDraft}
                  onSave={handleSaveDraft}
                />
                <Step2
                  stepperInstance={stepperInstance}
                  draftData={courseDraft}
                  onSave={handleSaveDraft}
                />
                <Step3
                  stepperInstance={stepperInstance}
                  draftData={courseDraft}
                  onSave={handleSaveDraft}
                />
                <Step4
                  stepperInstance={stepperInstance}
                  draftData={courseDraft}
                  onSave={handleSaveDraft}
                  onSubmit={handleSubmitCourse}
                  isSubmitting={isSubmitting}
                />
              </div>
            </CardBody>
          </div>
        </Card>
      </Container>
    </>
  );
};

export default CreateCourseForm;