import { Controller } from "react-hook-form";
import IconTextFormInput from '@/components/form/IconTextFormInput';
import { Link } from "react-router-dom";
import { BsEnvelopeFill } from "react-icons/bs";
import { FaLock } from "react-icons/fa";
import useSignIn from "@/app/auth/sign-in/useSignIn";

export default function SignInForm() {
  const { loading, login, control } = useSignIn();

  return (
    <form onSubmit={login}>
      <div className="mb-4">
        <IconTextFormInput control={control} icon={BsEnvelopeFill} placeholder="E-mail" label="Email address *" name="email" />
      </div>
      <div className="mb-4">
        <IconTextFormInput type='password' control={control} icon={FaLock} placeholder="Password" label="Password *" name="password" />
        <div id="passwordHelpBlock" className="form-text">
          Your password must be 8 characters at least
        </div>
      </div>
      <div className="mb-4 d-flex justify-content-between">
        <div className="form-check">
          <input type="checkbox" className="form-check-input" id="exampleCheck1" />
          <label className="form-check-label" htmlFor="exampleCheck1">
            Remember me
          </label>
        </div>
        <div className="text-primary-hover">
          <Link to="/auth/forgot-password" className="text-secondary">
            <u>Forgot password?</u>
          </Link>
        </div>
      </div>
      <div className="align-items-center mt-0">
        <div className="d-grid">
          <button className="btn btn-primary mb-0" disabled={loading} type="submit">
            Login
          </button>
        </div>
      </div>
    </form>
  );
}
