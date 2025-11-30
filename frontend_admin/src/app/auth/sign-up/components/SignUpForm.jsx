import IconTextFormInput from '@/components/form/IconTextFormInput';
import { Controller, useForm } from "react-hook-form";
import { BsEnvelopeFill } from "react-icons/bs";
import { FaLock, FaUser } from "react-icons/fa";
import { yupResolver } from "@hookform/resolvers/yup";
import useSignUp from "@/app/auth/sign-up/useSignUp";

import { signUpSchema } from '../signUpSchema';

export default function SignUpForm({ onSignUpSuccess }) {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const { loading, signUp } = useSignUp(onSignUpSuccess);

  const onSubmit = (data) => {
    const { confirmPassword, terms, ...payload } = data;
    signUp(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Name */}
      <div className="mb-4">
        <IconTextFormInput
          control={control}
          icon={FaUser}
          placeholder="Full Name"
          label="Full Name *"
          name="name"
        />
      </div>

      {/* Email */}
      <div className="mb-4">
        <IconTextFormInput
          control={control}
          icon={BsEnvelopeFill}
          placeholder="E-mail"
          label="Email address *"
          name="email"
        />
      </div>

      {/* Password */}
      <div className="mb-4">
        <IconTextFormInput
          control={control}
          type="password"
          icon={FaLock}
          placeholder="*********"
          label="Password *"
          name="password"
        />
      </div>

      {/* Confirm Password */}
      <div className="mb-4">
        <IconTextFormInput
          control={control}
          type="password"
          icon={FaLock}
          placeholder="*********"
          label="Confirm Password *"
          name="confirmPassword"
        />
      </div>

      {/* Terms checkbox */}
      <div className="mb-4">
        <Controller
          name="terms"
          control={control}
          render={({ field }) => (
            <div className="form-check">
              <input
                type="checkbox"
                className={`form-check-input ${errors.terms ? 'is-invalid' : ''}`}
                id="checkbox-1"
                checked={field.value}
                onChange={field.onChange}
              />
              <label className="form-check-label" htmlFor="checkbox-1">
                By signing up, you agree to the <a href="#">terms of service</a>
              </label>
            </div>
          )}
        />
        {errors.terms && (
          <div className="invalid-feedback d-block">
            {errors.terms.message}
          </div>
        )}
      </div>  

      {/* Submit button */}
      <div className="align-items-center mt-0">
        <div className="d-grid">
          <button className="btn btn-primary mb-0" type="submit" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </div>
      </div>
    </form>
  );
}
