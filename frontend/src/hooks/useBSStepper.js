import Stepper from "bs-stepper";
import { useEffect, useState } from "react";
import "bs-stepper/dist/css/bs-stepper.min.css";

const useBSStepper = (stepperRef, isReady = true) => {
  const [stepperInstance, setStepperInstance] = useState(null);
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    if (!stepperRef.current || !isReady) return;

    // create instance only once
    const instance = new Stepper(stepperRef.current, {
      linear: false,
      animation: true,
    });
    setStepperInstance(instance);

    const handleStepChange = (event) => {
      const currentStep = event.detail.to + 1;
      setActiveStep(currentStep);
    };

    const element = stepperRef.current;
    element.addEventListener('show.bs-stepper', handleStepChange);

    return () => {
      element.removeEventListener('show.bs-stepper', handleStepChange);
      instance.destroy();
    };
  }, [stepperRef, isReady]);

  return { stepperInstance, activeStep };
};

export default useBSStepper;