import { useState } from "react";
import { FaLock, FaKey, FaEye, FaEyeSlash } from "react-icons/fa";
import IconTextFormInput from "@/components/form/IconTextFormInput";
import useResetPassword from "../useResetPassword";

export default function ResetPasswordForm({ email }) {
  const { loading, handleSubmit, control, errors } = useResetPassword(email);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <IconTextFormInput
          control={control}
          icon={FaKey}
          placeholder="Enter 6-digit OTP"
          label="OTP Code"
          name="otp"
          disabled={loading}
          error={errors.otp}
          required
        />
        <div className="form-text small">
          Check your email <span className="text-primary fw-bold">{email}</span> for the code.
        </div>
      </div>

      <div className="mb-4 position-relative">
        <IconTextFormInput
          control={control}
          type={showPassword ? "text" : "password"}
          icon={FaLock}
          placeholder="New Password"
          label="New Password"
          name="password"
          disabled={loading}
          error={errors.password}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="position-absolute end-0 top-50 mt-3 me-5 translate-middle-y me-3 border-0 bg-transparent text-secondary"
          style={{ zIndex: 5 }}
        >
          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </button>
      </div>

      <div className="mb-4 position-relative">
        <IconTextFormInput
          control={control}
          type={showConfirm ? "text" : "password"}
          icon={FaLock}
          placeholder="Confirm New Password"
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
        >
          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </button>
      </div>

      <div className="align-items-center mt-0">
        <div className="d-grid">
          <button className="btn btn-primary mb-0" disabled={loading} type="submit">
            {loading ? "Resetting..." : "Change Password"}
          </button>
        </div>
      </div>
    </form>
  );
}