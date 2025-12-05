import { useState } from "react";
import IconTextFormInput from '@/components/form/IconTextFormInput';
import { Link } from "react-router-dom";
import { BsEnvelopeFill } from "react-icons/bs";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import useSignIn from "@/app/auth/sign-in/useSignIn";

export default function SignInForm() {
  const { loading, login, control } = useSignIn();

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={login}>
      <div className="mb-4">
        <IconTextFormInput
          control={control}
          icon={BsEnvelopeFill}
          placeholder="E-mail"
          label="Email address *"
          name="email" />
      </div>

      <div className="mb-4 position-relative">
        <IconTextFormInput
          type={showPassword ? 'text' : 'password'}
          control={control}
          icon={FaLock}
          placeholder="Password"
          label="Password *"
          name="password" />
        
        <button
            type="button" 
            onClick={togglePasswordVisibility}
            className="position-absolute end-0 top-50 mt-1 translate-middle-y me-3 border-0 bg-transparent text-secondary"
            style={{ zIndex: 5 }} 
        >
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </button>

        <div id="passwordHelpBlock" className="form-text">
          Your password must be 8 characters at least
        </div>
      </div>
      <div className="mb-4 d-flex justify-content-between">
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
