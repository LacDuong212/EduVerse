import { FaLock, FaKey } from "react-icons/fa";
import IconTextFormInput from "@/components/form/IconTextFormInput";
import IconPasswordFormInput from "@/components/form/IconPasswordFormInput";
import useResetPassword from "../useResetPassword";

export default function ResetPasswordForm({ email }) {
  const {
    loading,
    resendLoading,
    resendCooldown,
    handleResendOtp,
    handleSubmit,
    control,
    errors
  } = useResetPassword(email);

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
      <div>
        <div className="position-relative">
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

          <button
            type="button"
            className="btn btn-link position-absolute end-0 text-decoration-none px-3"
            style={{
              top: "38px",
              zIndex: 5,
              fontSize: "0.875rem",
            }}
            onClick={handleResendOtp}
            disabled={loading || resendLoading || resendCooldown > 0}
          >
            {resendLoading
              ? "Sending..."
              : resendCooldown > 0
                ? `${resendCooldown}s`
                : "Resend"}
          </button>
        </div>

        <div className="form-text small">
          Check your email <span className="text-primary fw-bold">{email}</span> for the code.
        </div>
      </div>

      <IconPasswordFormInput
        control={control}
        icon={FaLock}
        placeholder="New Password"
        label="New Password"
        name="password"
        disabled={loading}
        error={errors.password}
        required
      />

      <IconPasswordFormInput
        control={control}
        icon={FaLock}
        placeholder="Confirm New Password"
        label="Confirm Password"
        name="confirmPassword"
        disabled={loading}
        error={errors.confirmPassword}
        required
      />

      <div className="align-items-center mt-4">
        <div className="d-grid">
          <button className="btn btn-primary mb-0" disabled={loading} type="submit">
            {loading ? "Resetting..." : "Change Password"}
          </button>
        </div>
      </div>
    </form>
  );
}