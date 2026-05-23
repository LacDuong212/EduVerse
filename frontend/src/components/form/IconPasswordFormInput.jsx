import { useState } from "react";
import { Controller } from "react-hook-form";
import { FormControl, FormLabel, InputGroup } from "react-bootstrap";
import Feedback from "react-bootstrap/esm/Feedback";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const IconPasswordFormInput = ({
  name,
  containerClassName,
  control,
  id,
  label,
  icon: Icon,
  noValidate,
  required,
  ...other
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Controller
      name={name}
      defaultValue=""
      control={control}
      render={({ field, fieldState }) => (
        <div className={containerClassName ?? ""}>
          {label && (
            <FormLabel htmlFor={id ?? name}>
              {label}
              {required && <span className="text-danger ms-1">*</span>}
            </FormLabel>
          )}

          <InputGroup size="lg" className="position-relative">
            {Icon && (
              <span className="input-group-text bg-light rounded-start border-0 text-secondary px-3">
                <Icon />
              </span>
            )}

            <FormControl
              id={id ?? name}
              type={showPassword ? "text" : "password"}
              className="border-0 bg-light ps-1"
              style={{ borderRadius: "0" }}
              {...other}
              {...field}
              isInvalid={Boolean(fieldState.error?.message)}
            />
            <span
              className="input-group-text bg-light rounded-end border-0 text-secondary px-3 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: "pointer" }}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </span>
            {!noValidate && fieldState.error?.message && (
              <Feedback type="invalid" className="d-block">
                {fieldState.error?.message}
              </Feedback>
            )}
          </InputGroup>
        </div>
      )}
    />
  );
};

export default IconPasswordFormInput;