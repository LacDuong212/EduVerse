import { useState } from "react";
import { BsEnvelopeFill } from "react-icons/bs";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useSearchParams } from "react-router-dom";
import IconTextFormInput from "@/components/form/IconTextFormInput";
import useSignIn from "../useSignIn";

export default function SignInForm({ onSignUpSuccess }) {
  const { loading, login, control, errors } = useSignIn(onSignUpSuccess);
  const [showPassword, setShowPassword] = useState(false);

  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  return (
    <form onSubmit={login}>
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
          type={showPassword ? "text" : "password"}
          control={control}
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
          className="position-absolute end-0 top-50 mt-1 translate-middle-y me-3 border-0 bg-transparent text-secondary"
          style={{ zIndex: 5 }}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </button>

        <div className="d-flex justify-content-end mt-2 me-2">
          <Link to={`/auth/forgot-password${emailFromUrl ? `?email=${encodeURIComponent(emailFromUrl)}` : ''}`}
            className="fw-normal small"
          >
            <u>Forgot password?</u>
          </Link>
        </div>
      </div>

      <div className="align-items-center mt-3">
        <div className="d-grid">
          <button className="btn btn-primary mb-0" disabled={loading} type="submit">
            {loading ? (
              <span>Signing in...</span>
            ) : (
              "Login"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}