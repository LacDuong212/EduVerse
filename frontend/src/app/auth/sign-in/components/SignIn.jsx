import { Controller } from "react-hook-form";
import { Link } from "react-router-dom";
import { BsEnvelopeFill } from "react-icons/bs";
import { FaLock } from "react-icons/fa";
import useSignIn from "../useSignIn";

export default function SignIn() {
  const { loading, login, control } = useSignIn();

  return (
    <form onSubmit={login} className="space-y-6">
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
        <p className="text-sm text-gray-500 mt-1">
          Your password must be at least 8 characters long.
        </p>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center space-x-2">
          <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
          <span>Remember me</span>
        </label>
        <Link
          to="/auth/forgot-password"
          className="text-blue-600 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-sm hover:bg-blue-700 transition"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
