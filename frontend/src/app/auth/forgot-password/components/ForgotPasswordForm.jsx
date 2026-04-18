import { BsEnvelopeFill } from "react-icons/bs";
import IconTextFormInput from "@/components/form/IconTextFormInput";
import useForgotPassword from "../useForgotPassword";

const ForgotPasswordForm = ({ onForgotSuccess }) => {
  const { loading, forgotPassword, control, errors } = useForgotPassword(onForgotSuccess);

  return (
    <form onSubmit={forgotPassword}>
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
        <div className="form-text mt-2">
          Enter the email address associated with your account and we'll send you an OTP to reset your password.
        </div>
      </div>
      <div className="align-items-center">
        <div className="d-grid">
          <button className="btn btn-primary mb-0" type="submit" disabled={loading}>
            {loading ? "Sending OTP..." : "Reset Password"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;