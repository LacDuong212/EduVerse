import { FaFacebookF, FaGoogle } from "react-icons/fa";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import SignUpForm from "./components/SignUpForm";

export default function SignUpPage() {
  return (
    <AuthLayout>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-semibold mt-2 mb-3">Sign up for your account!</h1>
        <p className="text-gray-600 text-xl">
          Nice to see you! Please sign up to continue.
        </p>
      </div>

      <SignUpForm />

      <div className="relative my-8">
        <hr />
        <p className="absolute top-[-12px] left-1/2 transform -translate-x-1/2 bg-white px-3 text-gray-500 text-sm">
          Or
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-sm hover:bg-red-600 transition">
          <FaGoogle /> Signup with Google
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 bg-blue-700 text-white py-2 rounded-sm hover:bg-blue-800 transition">
          <FaFacebookF /> Signup with Facebook
        </button>
      </div>

      <p className="mt-6 text-center text-gray-600 text-sm">
        Already have an account?{" "}
        <Link to="/auth/sign-in" className="text-blue-600 hover:underline">
          Sign in here
        </Link>
      </p>
    </AuthLayout>
  );
}
