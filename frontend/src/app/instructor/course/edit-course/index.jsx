import { useRef, useState } from "react";
import { Badge, Button, Card, CardBody, CardHeader, Col, Collapse, Container, OverlayTrigger, Row, Spinner, Tooltip } from "react-bootstrap";
import { BsQuestionCircle } from "react-icons/bs";
import { FaArrowLeft, FaEraser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import PageMetaData from "@/components/PageMetaData";
import useBSStepper from "@/hooks/useBSStepper";

import { CourseEditorProvider, useCourseEditor } from "../CourseEditorContext";
import Step1 from "../components/step1";
import Step2 from "../components/step2";
import Step3 from "../components/step3";
import Step4 from "../components/step4";

const statusBadge = (status) => {
  const s = status?.toLowerCase();
  if (s === "live") return "success";
  if (s === "pending") return "warning";
  if (s === "draft") return "info";
  if (s === "rejected") return "orange";
  if (s === "blocked") return "danger";
  return "secondary";
};

const StepRef = ({ num }) => (
  <span
    className="btn btn-outline-primary bg-primary bg-opacity-10 btn-sm p-0 d-inline-flex align-items-center justify-content-center rounded-circle mx-1"
    style={{
      width: "1.3rem",
      height: "1.3rem",
      fontSize: "0.72rem",
      cursor: "default",
      pointerEvents: "none",
      verticalAlign: "middle",
      borderWidth: "1px",
      position: "relative",
    }}
  >
    {num}
  </span>
);

const BtnRef = ({ text }) => (
  <span
    className="btn btn-primary btn-sm mx-1 py-0 px-2 d-inline-flex align-items-center"
    style={{
      fontSize: "0.75rem",
      height: "1.3rem",
      lineHeight: "1",
      cursor: "default",
      pointerEvents: "none",
      verticalAlign: "middle",
      position: "relative",
    }}
  >
    {text}
  </span>
);

const MagicalGuideCard = () => {
  const [open, setOpen] = useState(false);

  return (
    <Card className="border-info border-2 overflow-hidden shadow-sm">
      <div className="d-flex align-items-stretch">
        <div
          className="bg-info d-flex align-items-center justify-content-center px-3 text-white"
          onClick={() => setOpen(!open)}
          role="button"
          style={{ cursor: "pointer", transition: "all 0.3s ease" }}
        >
          <BsQuestionCircle
            size={24}
            className="my-2"
            style={{
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.4s ease"
            }}
          />
        </div>

        <Collapse in={open} dimension="height">
          <div id="example-collapse-text">
            <div className="card-body" style={{ minWidth: "300px" }}>
              <ul className="list-unstyled mb-0 text-info">
                <li className="mb-2 d-flex align-items-start">
                  <span>
                    You can preview each step by clicking the step numbers
                    <StepRef num="1" />, <StepRef num="2" />, <StepRef num="3" /> and <StepRef num="4" /> at the top of the form.
                  </span>
                </li>
                <li className="mb-2 d-flex align-items-start">
                  <span>
                    Changes will be <strong>saved to server</strong> by clicking{" "}
                    <BtnRef text="Next" /> for each step. Uploaded videos, if not <strong>saved to server</strong>, will be removed after 24h.
                  </span>
                </li>
                <li className="d-flex align-items-start">
                  <span>When you're done, submit in step <StepRef num="4" /> to have it reviewed for publication!</span>
                </li>
              </ul>
            </div>
          </div>
        </Collapse>

        {!open && (
          <div
            className="d-flex align-items-center px-3 text-info"
            onClick={() => setOpen(true)}
            style={{ cursor: "pointer", userSelect: "none" }}
          >
            Need help?
          </div>
        )}
      </div>
    </Card>
  );
};

const EditCourseForm = () => {
  const navigate = useNavigate();
  const { currentCourse, isLoading, onDiscardChanges } = useCourseEditor();

  const stepperRef = useRef(null);
  const { stepperInstance, activeStep } = useBSStepper(stepperRef, !isLoading && !!currentCourse);

  if (isLoading) {
    return (
      <div className="position-absolute top-50 start-50 translate-middle">
        <Spinner
          animation="border"
          variant="primary"
          style={{ width: "30px", height: "30px" }}
        />
      </div>
    );
  }

  return (
    <>
      <PageMetaData title={"Edit Course"} />
      <Container className="mt-3 mb-5">
        <Row className="g-3 mb-3">
          {/* Navigation & Status & Discard */}
          <Col md={12}>
            <Row className="d-flex align-items-center gap-2">
              <Col>
                <Button variant="link" onClick={() => navigate(-1)} className="p-0 mb-0">
                  <FaArrowLeft className="mb-1 me-2" />Return
                </Button>
              </Col>
              <Col className="d-flex justify-content-end">
                <div className="d-flex justify-content-center align-items-center gap-3">
                  <div>
                    <span className="mb-0 me-2">Current Status:</span>
                    <Badge bg={statusBadge(currentCourse?.status)} className="text-uppercase px-2 py-1">
                      {currentCourse?.status}
                    </Badge>
                  </div>
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<Tooltip>Discard Changes</Tooltip>}
                  >
                    <Button
                      variant="outline-danger"
                      onClick={onDiscardChanges}
                      disabled={!currentCourse?.hasPendingChanges}
                      className="btn-sm btn-round d-flex flex-shrink-0 align-items-center justify-content-center mb-0"
                    >
                      <FaEraser className="me-1 fs-6" />
                    </Button>
                  </OverlayTrigger>
                </div>
              </Col>
            </Row>
          </Col>

          {/* Guide */}
          <Col md={12}><MagicalGuideCard /></Col>
        </Row>

        {/* Form */}
        <Card className="bg-transparent shadow-sm border rounded-3 mb-5">
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
                <div className="line mt-4" />
                <div className="step" data-target="#step-2">
                  <div className="d-grid text-center align-items-center">
                    <button type="button" className="btn btn-link step-trigger p-0 mb-2" role="tab" id="steppertrigger2" aria-controls="step-2">
                      <span className="bs-stepper-circle">2</span>
                    </button>
                    <h6 className="bs-stepper-label d-none d-md-block">Course Media <span className="text-danger">*</span></h6>
                  </div>
                </div>
                <div className="line mt-4" />
                <div className="step" data-target="#step-3">
                  <div className="d-grid text-center align-items-center">
                    <button type="button" className="btn btn-link step-trigger p-0 mb-2" role="tab" id="steppertrigger3" aria-controls="step-3">
                      <span className="bs-stepper-circle">3</span>
                    </button>
                    <h6 className="bs-stepper-label d-none d-md-block">Curriculum <span className="text-danger">*</span></h6>
                  </div>
                </div>
                <div className="line mt-4" />
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
                <Step1 stepperInstance={stepperInstance} activeStep={activeStep} />
                <Step2 stepperInstance={stepperInstance} activeStep={activeStep} />
                <Step3 stepperInstance={stepperInstance} activeStep={activeStep} />
                <Step4 stepperInstance={stepperInstance} activeStep={activeStep} />
              </div>
            </CardBody>
          </div>
        </Card>
      </Container>
    </>
  );
};

const EditCoursePage = () => (
  <CourseEditorProvider>
    <EditCourseForm />
  </CourseEditorProvider>
);

export default EditCoursePage;