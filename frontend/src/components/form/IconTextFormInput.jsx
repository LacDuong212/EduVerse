import { FormControl, FormLabel, InputGroup } from 'react-bootstrap';
import Feedback from 'react-bootstrap/esm/Feedback';
import { Controller } from 'react-hook-form';
const IconTextFormInput = ({
  name,
  containerClassName,
  control,
  id,
  label,
  icon,
  noValidate,
  ...other
}) => {
  const Icon = icon;
  return <Controller name={name} defaultValue={''} control={control} render={({
    field,
    fieldState
  }) => <div className={containerClassName ?? ''}>
          {label && <FormLabel>{label}</FormLabel>}
          <InputGroup size="lg">
            <span className="input-group-text bg-light rounded-start border-0 text-secondary px-3">
              <Icon />
            </span>
            <FormControl className="border-0 bg-light rounded-end ps-1" {...other} {...field} isInvalid={Boolean(fieldState.error?.message)} />
            {!noValidate && fieldState.error?.message && <Feedback type="invalid">{fieldState.error?.message}</Feedback>}
          </InputGroup>
        </div>} />;
};
export default IconTextFormInput;
