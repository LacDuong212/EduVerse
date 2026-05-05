import Choices from "choices.js";
import { useEffect, useRef } from "react";

const ChoicesFormInput = ({
  children,
  multiple,
  className,
  onChange,
  allowInput,
  options,
  value,
  isInvalid,
  error,
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
      itemSelectText: "",
    });

    const element = choicesInstance.current.passedElement.element;

    const handleChange = (e) => {
      if (e.target !== element) return;

      onChange?.({
        target: {
          name: element.name || props.name,
          value: e.target.value,
          type: element.type,
          id: element.id || props.id,
        }
      });
    };

    element.addEventListener("change", handleChange);

    return () => {
      element.removeEventListener("change", handleChange);
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
    <div className={`choices-wrapper ${isInvalid ? "is-invalid" : ""}`}>
      {allowInput ? (
        <input ref={choicesRef} multiple={multiple} className={className} {...props} />
      ) : (
        <select ref={choicesRef} multiple={multiple} className={className} {...props}>
          {children}
        </select>
      )}
      {isInvalid && error && (
        <div className="invalid-feedback">
          {error}
        </div>
      )}
    </div>
  );
};

export default ChoicesFormInput;