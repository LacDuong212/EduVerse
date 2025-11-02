import PageMetaData from '@/components/PageMetaData';
import useBSStepper from '@/hooks/useBSStepper';
import { useEffect, useRef } from 'react';
import { Card, CardBody, CardHeader, Col, Container, Row } from 'react-bootstrap';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';


const CreateCourseForm = () => {
  const stepperRef = useRef(null);
  const stepperInstance = useBSStepper(stepperRef);
  useEffect(() => {
    stepperInstance?.to(1);
  }, [stepperInstance]);
  return (
  <section>
      <PageMetaData title="Create a Course" />
      <Container>
        <Row>
          <Col md={8} className="mx-auto text-center">
            <p className="text-center">
              Use this interface to add a new Course to the portal. Once you are done adding the item it will be reviewed for quality. If approved,
              your course will appear for sale and you will be informed by email that your course has been accepted.
            </p>
          </Col>
        </Row>
        <Card className="bg-transparent border rounded-3 mb-5">
          <div id="stepper" ref={stepperRef} className="bs-stepper stepper-outline">
            <CardHeader className="bg-light border-bottom px-lg-5">
              <div className="bs-stepper-header" role="tablist">
                <div className="step" data-target="#step-1">
                  <div className="d-grid text-center align-items-center">
                    <button type="button" className="btn btn-link step-trigger mb-0" role="tab" id="steppertrigger1" aria-controls="step-1">
                      <span className="bs-stepper-circle">1</span>
                    </button>
                    <h6 className="bs-stepper-label d-none d-md-block">Course details</h6>
                  </div>
                </div>
                <div className="line" />
                <div className="step" data-target="#step-2">
                  <div className="d-grid text-center align-items-center">
                    <button type="button" className="btn btn-link step-trigger mb-0" role="tab" id="steppertrigger2" aria-controls="step-2">
                      <span className="bs-stepper-circle">2</span>
                    </button>
                    <h6 className="bs-stepper-label d-none d-md-block">Course media</h6>
                  </div>
                </div>
                <div className="line" />
                <div className="step" data-target="#step-3">
                  <div className="d-grid text-center align-items-center">
                    <button type="button" className="btn btn-link step-trigger mb-0" role="tab" id="steppertrigger3" aria-controls="step-3">
                      <span className="bs-stepper-circle">3</span>
                    </button>
                    <h6 className="bs-stepper-label d-none d-md-block">Curriculum</h6>
                  </div>
                </div>
                <div className="line" />
                <div className="step" data-target="#step-4">
                  <div className="d-grid text-center align-items-center">
                    <button type="button" className="btn btn-link step-trigger mb-0" role="tab" id="steppertrigger4" aria-controls="step-4">
                      <span className="bs-stepper-circle">4</span>
                    </button>
                    <h6 className="bs-stepper-label d-none d-md-block">Additional information</h6>
                  </div>
                </div>
              </div>
            </CardHeader>
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
    </section>
    );
};
export default CreateCourseForm;
