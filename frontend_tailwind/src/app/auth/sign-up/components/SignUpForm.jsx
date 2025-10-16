import { Controller, useForm } from "react-hook-form";
import { BsEnvelopeFill } from "react-icons/bs";
import { FaLock, FaUser } from "react-icons/fa";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import useSignUp from "../useSignUp";

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

export default function SignUpForm() {
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { loading, signUp } = useSignUp();

  const onSubmit = (data) => {
    const { confirmPassword, ...payload } = data;
    signUp(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Full Name */}
      <div>
        <label className="block text-gray-700 mb-1">Full Name *</label>
        <div className="relative">
          <FaUser className="absolute left-3 top-3 text-gray-400" />
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Full Name"
                className="w-full pl-10 pr-3 py-2 border rounded-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
            )}
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-gray-700 mb-1">Email address *</label>
        <div className="relative">
          <BsEnvelopeFill className="absolute left-3 top-3 text-gray-400" />
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="email"
                placeholder="E-mail"
                className="w-full pl-10 pr-3 py-2 border rounded-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
            )}
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-gray-700 mb-1">Password *</label>
        <div className="relative">
          <FaLock className="absolute left-3 top-3 text-gray-400" />
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="password"
                placeholder="Password"
                className="w-full pl-10 pr-3 py-2 border rounded-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
            )}
          />
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-gray-700 mb-1">Confirm Password *</label>
        <div className="relative">
          <FaLock className="absolute left-3 top-3 text-gray-400" />
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="password"
                placeholder="Confirm Password"
                className="w-full pl-10 pr-3 py-2 border rounded-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
            )}
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-sm hover:bg-blue-700 transition"
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>
    </form>
  );
}
