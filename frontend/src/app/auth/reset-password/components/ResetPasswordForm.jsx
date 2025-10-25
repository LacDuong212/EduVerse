import IconTextFormInput from '../../../../components/form/IconTextFormInput';
import { FaLock } from "react-icons/fa";
import useResetPassword from "../useResetPassword";

export default function ResetPasswordForm({ email }) {
  const { loading, handleSubmit, resetPassword, control } = useResetPassword(email);

  return (
    <form onSubmit={handleSubmit(resetPassword)}>
      <div className="mb-4">
        <IconTextFormInput type='password' control={control} icon={FaLock} placeholder="New Password" label="New Password *" name="password" />
      </div>
      <div className="mb-4">
        <IconTextFormInput type='password' control={control} icon={FaLock} placeholder="Confirm Password" label="Confirm Password *" name="confirmPassword" />
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
