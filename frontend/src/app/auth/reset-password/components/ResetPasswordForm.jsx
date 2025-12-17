import { useState } from "react";
import IconTextFormInput from '@/components/form/IconTextFormInput';
import { FaLock, FaKey, FaEye, FaEyeSlash } from "react-icons/fa";
import useResetPassword from "@/app/auth/reset-password/useResetPassword";

export default function ResetPasswordForm({ email }) {
  const { loading, handleSubmit, resetPassword, control } = useResetPassword(email);

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit(resetPassword)}>
      <div className="mb-4">
        <IconTextFormInput
          control={control}
          icon={FaKey}
          placeholder="Enter 6-digit OTP"
          label="OTP Code *"
          name="otp"
        />
        <div className="form-text">
          Check your email: <strong>{email}</strong> for the code.
        </div>
      </div>
      <div className="mb-4 position-relative">
        <IconTextFormInput
          control={control}
          type={showPassword ? 'text' : 'password'}
          icon={FaLock}
          placeholder="Password"
          label="Password *"
          name="password"
        />

        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="position-absolute end-0 top-50 mt-3 translate-middle-y me-3 border-0 bg-transparent text-secondary"
          style={{ zIndex: 5 }}
        >
          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </button>
      </div>

      {/* Confirm Password */}
      <div className="mb-4 position-relative">
        <IconTextFormInput
          control={control}
          type={showPassword ? 'text' : 'password'}
          icon={FaLock}
          placeholder="Confirm Password"
          label="Confirm Password *"
          name="confirmPassword"
        />

        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="position-absolute end-0 top-50 mt-3 translate-middle-y me-3 border-0 bg-transparent text-secondary"
          style={{ zIndex: 5 }}
        >
          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </button>
      </div>

      <div className="align-items-center mt-0">
        <div className="d-grid">
          <button className="btn btn-primary mb-0" disabled={loading} type="submit">
            {loading ? "Changing..." : "Change Password"}
          </button>
        </div>
      </div>
    </form>
  );
}
