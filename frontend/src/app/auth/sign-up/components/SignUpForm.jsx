import { BsEnvelopeFill } from "react-icons/bs";
import { FaLock, FaUser } from "react-icons/fa";
import { Controller } from "react-hook-form";
import { Link } from "react-router-dom";
import IconTextFormInput from "@/components/form/IconTextFormInput";
import IconPasswordFormInput from "@/components/form/IconPasswordFormInput";
import useSignUp from "../useSignUp";

export default function SignUpForm({ onSignUpSuccess }) {
  const { loading, signUp, control, errors } = useSignUp(onSignUpSuccess);

  return (
    <form onSubmit={signUp}>
      <div className="d-flex flex-column gap-4">
        <IconTextFormInput
          control={control}
          icon={FaUser}
          placeholder="Full Name"
          label="Full Name"
          name="name"
          disabled={loading}
          error={errors.name}
          required
        />

        <IconTextFormInput
          control={control}
          icon={BsEnvelopeFill}
          placeholder="E-mail"
          label="Email Address"
          name="email"
          disabled={loading}
          error={errors.email}
          required
        />

        <IconPasswordFormInput
          control={control}
          icon={FaLock}
          placeholder="Password"
          label="Password"
          name="password"
          disabled={loading}
          error={errors.password}
          required
        />

        <IconPasswordFormInput
          control={control}
          icon={FaLock}
          placeholder="Confirm Password"
          label="Confirm Password"
          name="confirmPassword"
          disabled={loading}
          error={errors.confirmPassword}
          required
        />
      </div>

      <div className="mt-2">
        <Controller
          name="terms"
          control={control}
          render={({ field }) => (
            <div className="form-check">
              <input
                type="checkbox"
                className={`form-check-input ${errors.terms ? "is-invalid" : ""}`}
                id="terms-check"
                checked={field.value}
                onChange={field.onChange}
                disabled={loading}
              />
              <label className="form-check-label small" htmlFor="terms-check">
                By signing up, you agree to the <Link to="/terms">terms of service</Link>
              </label>
            </div>
          )}
        />
        {errors.terms && (
          <div className="invalid-feedback">{errors.terms.message}</div>
        )}

        <div className="d-grid mt-4">
          <button className="btn btn-primary mb-0" type="submit" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </div>
      </div>
    </form>
  );
}