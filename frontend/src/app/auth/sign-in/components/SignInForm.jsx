import { BsEnvelopeFill } from "react-icons/bs";
import { FaLock } from "react-icons/fa";
import { Link, useSearchParams } from "react-router-dom";
import IconTextFormInput from "@/components/form/IconTextFormInput";
import IconPasswordFormInput from "@/components/form/IconPasswordFormInput";
import useSignIn from "../useSignIn";

export default function SignInForm({ onSignUpSuccess }) {
  const { loading, login, control, errors } = useSignIn(onSignUpSuccess);

  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  return (
    <form onSubmit={login}>
      <div className="d-flex flex-column gap-4">
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

        <div>
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
          <div className="d-flex justify-content-end mt-2 me-2">
            <Link
              to={`/auth/forgot-password${emailFromUrl ? `?email=${encodeURIComponent(emailFromUrl)}` : ''}`}
              className="small"
            >
              <u>Forgot your password?</u>
            </Link>
          </div>
        </div>
      </div>

      <div className="d-grid mt-4">
        <button className="btn btn-primary mb-0" disabled={loading} type="submit">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </div>
    </form>
  );
}