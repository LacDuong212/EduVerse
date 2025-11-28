import PageMetaData from '@/components/PageMetaData';
import { EDIT_COURSE_DRAFT_STORAGE_KEY } from '@/context/constants';
import useBSStepper from '@/hooks/useBSStepper';

import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';

import axios from 'axios';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Alert, Button, Card, CardBody, CardHeader, Col, Container, Row } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';


const EditCourseForm = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const { id } = useParams(); // get from route ../instructor/courses/edit/:id
  const stepperRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);    // to track unsaved changes
  const DYNAMIC_DRAFT_KEY = `${EDIT_COURSE_DRAFT_STORAGE_KEY}_${id}`; // create draft key
  const [courseDraft, setCourseDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const stepperInstance = useBSStepper(stepperRef, !isLoading && !!courseDraft);

  const handleGoBack = () => {
    navigate(-1);
  };

  // get course data
  useEffect(() => {
    const loadCourseData = async () => {
      if (!id) {
        toast.error('Unable to load course\'s details');
        navigate('/instructor/courses');
        return;
      }

      try {
        // check for an existing draft
        const storedDraft = sessionStorage.getItem(DYNAMIC_DRAFT_KEY);
        if (storedDraft && hasMeaningfulDraftData(JSON.parse(storedDraft))) {
          console.log('Restoring draft from sessionStorage...');
          setCourseDraft(JSON.parse(storedDraft));
        } else {
          // if no draft, fetch instead
          console.log('Fetching course data to edit...');

          const { data: res } = await axios.get(
            `${backendUrl}/api/instructor/courses/${id}`,
            { withCredentials: true }
          );

          if (res.success && res.course) {
            setCourseDraft(res.course);
          } else {
            throw new Error(res.message || 'Failed to fetch course data');
          }
        }
      } catch (error) {
        console.error('Failed to load course: ', error);
        toast.error(error.message || 'Could not load course data');
        navigate('/instructor/courses'); // redirect back
      } finally {
        setIsLoading(false);
      }
    };

    loadCourseData();
  }, [id, navigate, DYNAMIC_DRAFT_KEY]);

  // saving changes to draft
  useEffect(() => {
    sessionStorage.setItem(DYNAMIC_DRAFT_KEY, JSON.stringify(courseDraft));
  }, [courseDraft]);

  // warning when leaving site without submitting changes
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isDirty) {
        // necessary
        event.preventDefault();
        event.returnValue = ''; // required for most browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);  // active if isDirty = true

  // init stepper
  useEffect(() => {
    stepperInstance?.to(1);
  }, [stepperInstance]);

  // data handler
  const handleSaveDraft = useCallback((stepData) => {
    setCourseDraft((prevDraft) => ({
      ...prevDraft,
      ...stepData,
    }));
    setIsDirty(true); // draft changes
  }, []);

  // helper
  const hasMeaningfulDraftData = (draft) => {
    if (!draft) return false;

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

    // check if changed
    if (!isDirty) {
      toast.info('No changes detected to submit.');
      return;
    }

    // comfirming
    const isConfirmed = window.confirm(
      'Are you sure you want to submit these changes for review?'
    );
    if (!isConfirmed) {
      return; // user cancel
    }

    setIsSubmitting(true);
    try {
      const { data: res } = await axios.put(
        `${backendUrl}/api/courses/${id}`,
        courseDraft,
        { withCredentials: true }
      );

      // handle response
      if (res.success) {
        toast.success(res.message || 'Course updated and submitted for review!');

        // clear the draft from storage and state
        sessionStorage.removeItem(DYNAMIC_DRAFT_KEY);
        setIsDirty(false);  // reset

        // redirect
        navigate('/instructor/courses');
      } else {
        toast.error('Submission failed');
        throw new Error(res.message || 'Submission failed');
      }

    } catch (error) {
      console.error('Failed to submit course changes', error);
      toast.error(error.message || 'Failed to submit course changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    (isLoading || !courseDraft) ? (
      <div className="p-5 text-center">Loading...</div>
    ) : (
      <>
        <PageMetaData title="Edit Course" />
        <Container className="mt-3 mb-5">
          <Row>
            <Col md={12} className="mx-auto text-center">
              <div className="text-start mb-3">
                <Button variant="link" onClick={handleGoBack} className="p-0">
                  <FaArrowLeft className="mb-1 me-2" />Return
                </Button>
              </div>
              <p className="text-center">
                Use this interface to update your course. After submission, your changes will be reviewed for quality.
                <br />
                Once approved, your course will be republished and you’ll be notified by email.
              </p>  {/* #TODO: send email */}
            </Col>
            <Col className="mx-auto text-center">
              <Alert className="mb-2 text-center" variant="primary">
                You will lose all progress if you close this site or not submitting course within 24h.
              </Alert>
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
    )
  );
};

export default EditCourseForm;
