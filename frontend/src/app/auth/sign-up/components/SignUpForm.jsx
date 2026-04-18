import { useState } from "react";
import { BsEnvelopeFill } from "react-icons/bs";
import { FaLock, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { Controller } from "react-hook-form";
import { Link } from "react-router-dom";
import IconTextFormInput from "@/components/form/IconTextFormInput";
import useSignUp from "../useSignUp";

export default function SignUpForm({ onSignUpSuccess }) {
  const { loading, signUp, control, errors } = useSignUp(onSignUpSuccess);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <form onSubmit={signUp}>
      <div className="mb-4">
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
      </div>

      <div className="mb-4">
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
      </div>

      <div className="mb-4 position-relative">
        <IconTextFormInput
          control={control}
          type={showPassword ? "text" : "password"}
          icon={FaLock}
          placeholder="Password"
          label="Password"
          name="password"
          disabled={loading}
          error={errors.password}
          required
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="position-absolute end-0 top-50 mt-3 me-3 translate-middle-y border-0 bg-transparent text-secondary"
          style={{ zIndex: 5 }}
          disabled={loading}
        >
          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </button>
      </div>

      <div className="mb-4 position-relative">
        <IconTextFormInput
          control={control}
          type={showConfirm ? "text" : "password"}
          icon={FaLock}
          placeholder="Confirm Password"
          label="Confirm Password"
          name="confirmPassword"
          disabled={loading}
          error={errors.confirmPassword}
          required
        />

        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="position-absolute end-0 top-50 mt-3 translate-middle-y me-3 border-0 bg-transparent text-secondary"
          style={{ zIndex: 5 }}
          disabled={loading}
        >
          {showConfirm ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </button>
      </div>

      <div className="mb-2">
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
      </div>

      <div className="align-items-center">
        <div className="d-grid">
          <button className="btn btn-primary mb-0" type="submit" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </div>
      </div>
    </form>
  );
}