import Choices from 'choices.js';
import { useEffect, useRef } from 'react';


const ChoicesFormInput = ({
  children,
  multiple,
  className,
  onChange,
  allowInput,
  options,
  value,
  ...props
}) => {
  const choicesRef = useRef(null);
  const choicesInstance = useRef(null);

  useEffect(() => {
    if (!choicesRef.current) return;

    // initialise Choices.js once
    choicesInstance.current = new Choices(choicesRef.current, {
      ...options,
      placeholder: true,
      allowHTML: true,
      shouldSort: false,
      itemSelectText: '',
    });

    const element = choicesInstance.current.passedElement.element;

    const handleChange = (e) => {
      if (e.target !== element) return;
      onChange?.(e.target.value);
    };

    element.addEventListener('change', handleChange);

    return () => {
      element.removeEventListener('change', handleChange);
      if (choicesInstance.current) {
        choicesInstance.current.destroy();
      }
    };
  }, []);

  // sync external `value` changes with Choices.js
  useEffect(() => {
    if (choicesInstance.current && value !== undefined) {
      const current = choicesInstance.current.getValue(true);
      if (current !== value) {
        choicesInstance.current.setChoiceByValue(value);
      }
    }
  }, [value]);

  return (
    <div className="choices-wrapper">
      {allowInput ? (
        <input ref={choicesRef} multiple={multiple} className={className} {...props} />
      ) : (
        <select ref={choicesRef} multiple={multiple} className={className} {...props}>
          {children}
        </select>
      )}
    </div>
  );
};

export default ChoicesFormInput;
