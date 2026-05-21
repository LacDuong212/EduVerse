import { FormControl, FormGroup, FormLabel } from "react-bootstrap";
import Feedback from "react-bootstrap/esm/Feedback";

const TextFormInput = ({
  name,
  containerClassName: containerClass,
  id,
  label,
  noValidate,
  labelClassName: labelClass,
  isInvalid,
  error,
  value,
  onChange,
  required,
  ...other
}) => {
  return (
    <FormGroup className={containerClass}>
      {label && (
        typeof label === "string" ? (
          <FormLabel htmlFor={id ?? name} className={labelClass}>
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </FormLabel>
        ) : (
          <>{label}</>
        )
      )}
      
      <FormControl 
        id={id ?? name} 
        name={name}
        value={value ?? ""}
        onChange={onChange}
        isInvalid={isInvalid || Boolean(error)} 
        {...other} 
      />

      {!noValidate && (isInvalid || error) && (
        <Feedback type="invalid">
          {error}
        </Feedback>
      )}
    </FormGroup>
  );
};

export default TextFormInput;