import Stepper from 'bs-stepper';
import { useEffect, useState } from 'react';
import 'bs-stepper/dist/css/bs-stepper.min.css';


const useBSStepper = (stepperRef, isReady = true) => {
  const [stepperInstance, setStepperInstance] = useState(null);

  useEffect(() => {
    if (!stepperRef.current || !isReady) return;

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
  }, [stepperRef, isReady]);

  return stepperInstance;
};

export default useBSStepper;
