import Stepper from 'bs-stepper';
import { useEffect, useState } from 'react';
import 'bs-stepper/dist/css/bs-stepper.min.css';


const useBSStepper = (stepperRef) => {
  const [stepperInstance, setStepperInstance] = useState(null);

  useEffect(() => {
    if (!stepperRef.current) return;

    // create instance only once
    const instance = new Stepper(stepperRef.current, {
      linear: false,
      animation: true,
    });
    setStepperInstance(instance);

    instance.to(1);

    // cleanup on unmount
    return () => {
      instance.destroy();
    };
  }, [stepperRef]);

  return stepperInstance;
};

export default useBSStepper;
