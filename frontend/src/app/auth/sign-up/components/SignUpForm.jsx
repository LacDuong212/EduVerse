import IconTextFormInput from '@/components/form/IconTextFormInput';
import { useForm } from "react-hook-form";
import { BsEnvelopeFill } from "react-icons/bs";
import { FaLock, FaUser } from "react-icons/fa";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import useSignUp from "@/app/auth/sign-up/useSignUp";

const schema = yup.object({
  name: yup.string().required("Please enter your full name"),
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("Please enter your email"),
  password: yup.string().required("Please enter your password"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
});

export default function SignUpForm({ onSignUpSuccess }) {
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { loading, signUp } = useSignUp(onSignUpSuccess);

  const onSubmit = (data) => {
    const { confirmPassword, ...payload } = data;
    signUp(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Name */}
      <div className="mb-4">
        <IconTextFormInput
          control={control}
          icon={FaUser}
          placeholder="Full Name"
          label="Full Name *"
          name="name"
        />
      </div>

      {/* Email */}
      <div className="mb-4">
        <IconTextFormInput
          control={control}
          icon={BsEnvelopeFill}
          placeholder="E-mail"
          label="Email address *"
          name="email"
        />
      </div>

      {/* Password */}
      <div className="mb-4">
        <IconTextFormInput
          control={control}
          type="password"
          icon={FaLock}
          placeholder="*********"
          label="Password *"
          name="password"
        />
      </div>

      {/* Confirm Password */}
      <div className="mb-4">
        <IconTextFormInput
          control={control}
          type="password"
          icon={FaLock}
          placeholder="*********"
          label="Confirm Password *"
          name="confirmPassword"
        />
      </div>

      {/* Terms checkbox */}
      <div className="mb-4">
        <div className="form-check">
          <input type="checkbox" className="form-check-input" id="checkbox-1" />
          <label className="form-check-label" htmlFor="checkbox-1">
            By signing up, you agree to the <a href="#">terms of service</a>
          </label>
        </div>
      </div>

      {/* Submit button */}
      <div className="align-items-center mt-0">
        <div className="d-grid">
          <button className="btn btn-primary mb-0" type="submit" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </div>
      </div>
    </form>
  );
}
