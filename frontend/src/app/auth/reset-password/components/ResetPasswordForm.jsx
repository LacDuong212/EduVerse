import { FaKey, FaLock } from "react-icons/fa";
import IconTextFormInput from "@/components/form/IconTextFormInput";
import IconPasswordFormInput from "@/components/form/IconPasswordFormInput";
import useResetPassword from "../useResetPassword";

export default function ResetPasswordForm({ email }) {
  const { loading, handleSubmit, control, errors } = useResetPassword(email);

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
      <div>
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
        placeholder="Re-enter New Password"
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