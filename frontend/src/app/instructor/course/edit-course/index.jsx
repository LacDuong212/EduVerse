import { useRef } from "react";
import { Alert, Badge, Button, Card, CardBody, CardHeader, Col, Container, Row } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import PageMetaData from "@/components/PageMetaData";
import useBSStepper from "@/hooks/useBSStepper";
import { CourseEditorProvider, useCourseEditor } from "../CourseEditorContext";

// Steps
import Step1 from "../components/step1";
import Step2 from "../components/step2";
import Step3 from "../components/step3";
import Step4 from "../components/step4";

const EditCourseContent = () => {
  const navigate = useNavigate();
  const { currentCourse, isLoading } = useCourseEditor();

  const stepperRef = useRef(null);
  const stepperInstance = useBSStepper(stepperRef, !isLoading && !!currentCourse);

  const isDraft = currentCourse?.status?.toUpperCase() === "DRAFT";

  const StepRef = ({ num }) => (
    <span
      className="btn btn-outline-primary btn-sm p-0 d-inline-flex align-items-center justify-content-center rounded-circle mx-1"
      style={{
        width: "1.3rem",
        height: "1.3rem",
        fontSize: "0.75rem",
        cursor: "default",
        pointerEvents: "none",
        verticalAlign: "middle",
        borderWidth: "1px",
        position: "relative",
        top: "-1px"
      }}
    >
      {num}
    </span>
  );

  const BtnRef = ({ text }) => (
    <span
      className="btn btn-primary btn-sm py-0 px-2 d-inline-flex align-items-center"
      style={{
        fontSize: "0.75rem",
        height: "1.3rem",
        lineHeight: "1",
        cursor: "default",
        pointerEvents: "none",
        verticalAlign: "middle",
        position: "relative",
        top: "-1px"
      }}
    >
      {text}
    </span>
  );

  return (
    <>
      <PageMetaData title={"Edit Course"} />
      <Container className="mt-3 mb-5">
        <Row>
          <Col md={12} className="d-flex align-items-center justify-content-between mb-3">
            <Button variant="link" onClick={() => navigate(-1)} className="p-0 mb-0">
              <FaArrowLeft className="mb-1 me-2" />Return
            </Button>

            <Badge bg={isDraft ? "info" : "warning"} className="text-uppercase p-2">
              Mode: {isDraft ? "Draft Editing" : "Live Editing"}
            </Badge>
          </Col>

          <Col md={12}>
            <Alert variant={isDraft ? "info" : "warning"} className="border-0 shadow-sm d-flex align-items-start">
              <div className="me-3 fs-4 my-auto">
                {isDraft ? "💾" : "⚠️"}
              </div>
              <div className="flex-grow-1">
                <Alert.Heading className="fs-6 mb-2 fw-bold">
                  {isDraft ? "Editing Draft Course" : "Editing Published Course"}
                </Alert.Heading>

                <ul className="list-unstyled mb-0 small">
                  <li className="mb-2 d-flex align-items-center">
                    <span className="me-2">•</span>
                    <span>
                      You can preview each step by clicking the step numbers
                      <StepRef num="1" />,<StepRef num="2" /> ,<StepRef num="3" /> and <StepRef num="4" /> at the top of the form.
                    </span>
                  </li>

                  <li className="mb-2 d-flex align-items-center">
                    <span className="me-2">•</span>
                    <span>
                      Changes will be <strong>saved {isDraft ? "to cloud" : "locally"}</strong> by clicking{' '}
                      <BtnRef text="Next" /> for each step{isDraft ? (
                        <span>, preventing loss of work <strong> when closing the tab or navigating away!</strong></span>
                      ) : "."}
                    </span>
                  </li>

                  <li className="d-flex align-items-start">
                    <span className="me-2">•</span>
                    {isDraft ? (
                      <span>When you're done, submit in Step 4 to have it reviewed for publication!</span>
                    ) : (
                      <span>
                        Have your changes <strong>submitted</strong> in Step 4 to prevent loss of work
                        <strong> when closing the tab or navigating away!</strong>
                      </span>
                    )}
                  </li>
                </ul>
              </div>
            </Alert>
          </Col>
        </Row>

        <Card className="bg-transparent border rounded-3 mb-5">
          <div id="stepper" ref={stepperRef} className="bs-stepper stepper-outline">
            {/* --- Stepper Header --- */}
            <CardHeader className="bg-light border-bottom px-lg-5">
              <div className="bs-stepper-header" role="tablist">
                {/* --- Stepper Headers --- */}
                <div className="step" data-target="#step-1">
                  <div className="d-grid text-center align-items-center">
                    <button type="button" className="btn btn-link step-trigger p-0 mb-2" role="tab" id="steppertrigger1" aria-controls="step-1">
                      <span className="bs-stepper-circle">1</span>
                    </button>
                    <h6 className="bs-stepper-label d-none d-md-block">Course Details <span className="text-danger">*</span></h6>
                  </div>
                </div>
                <div className="line" />
                <div className="step" data-target="#step-2">
                  <div className="d-grid text-center align-items-center">
                    <button type="button" className="btn btn-link step-trigger p-0 mb-2" role="tab" id="steppertrigger2" aria-controls="step-2">
                      <span className="bs-stepper-circle">2</span>
                    </button>
                    <h6 className="bs-stepper-label d-none d-md-block">Course Media <span className="text-danger">*</span></h6>
                  </div>
                </div>
                <div className="line" />
                <div className="step" data-target="#step-3">
                  <div className="d-grid text-center align-items-center">
                    <button type="button" className="btn btn-link step-trigger p-0 mb-2" role="tab" id="steppertrigger3" aria-controls="step-3">
                      <span className="bs-stepper-circle">3</span>
                    </button>
                    <h6 className="bs-stepper-label d-none d-md-block">Curriculum <span className="text-danger">*</span></h6>
                  </div>
                </div>
                <div className="line" />
                <div className="step" data-target="#step-4">
                  <div className="d-grid text-center align-items-center">
                    <button type="button" className="btn btn-link step-trigger p-0 mb-2" role="tab" id="steppertrigger4" aria-controls="step-4">
                      <span className="bs-stepper-circle">4</span>
                    </button>
                    <h6 className="bs-stepper-label d-none d-md-block">Additional Information</h6>
                  </div>
                </div>
              </div>
            </CardHeader>

            {/* --- Stepper Content --- */}
            <CardBody>
              <div className="bs-stepper-content">
                <Step1 stepperInstance={stepperInstance} />
                <Step2 stepperInstance={stepperInstance} />
                <Step3 stepperInstance={stepperInstance} />
                <Step4 stepperInstance={stepperInstance} />
              </div>
            </CardBody>
          </div>
        </Card>
      </Container>
    </>
  );
};

const EditCourseForm = () => (
  <CourseEditorProvider>
    <EditCourseContent />
  </CourseEditorProvider>
);

export default EditCourseForm;