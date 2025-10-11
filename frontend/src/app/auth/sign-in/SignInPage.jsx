import { FaFacebookF, FaGoogle } from "react-icons/fa";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import SignIn from "./components/SignIn";

export default function SignInPage() {
  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <span className="text-5xl">👋</span>
        <h1 className="text-4xl font-semibold mt-2">Login into EduVerse!</h1>
        <p className="text-gray-600 text-xl">
          Nice to see you! Please log in with your account.
        </p>
      </div>

      <SignIn />

      <div className="relative my-8">
        <hr />
        <p className="absolute top-[-12px] left-1/2 transform -translate-x-1/2 bg-white px-3 text-gray-500 text-sm">
          Or
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-sm hover:bg-red-600 transition">
          <FaGoogle /> Login with Google
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 bg-blue-700 text-white py-2 rounded-sm hover:bg-blue-800 transition">
          <FaFacebookF /> Login with Facebook
        </button>
      </div>

      <p className="mt-6 text-center text-gray-600 text-sm">
        Don’t have an account?{" "}
        <Link to="/auth/sign-up" className="text-blue-600 hover:underline">
          Signup here
        </Link>
      </p>
    </AuthLayout>
  );
}
