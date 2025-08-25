import React, { useContext, useState } from "react";
import axios from "axios";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const { backendUrl } = useContext(AppContent);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmithandler = async (e) => {
    e.preventDefault();
    if (loading) return; // chặn click liên tiếp
    setLoading(true);

    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/forgot-password",
        { email }
      );

      if (data.success) {
        toast.success(data.message);
        navigate("/check-reset-otp", { state: { email } });

      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0">
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          Forgot Password
        </h2>
        {/* 🟢 đổi chữ cho đúng flow OTP */}
        <p className="text-center text-sm mb-6">
          Enter your email to receive OTP
        </p>

        <form onSubmit={onSubmithandler}>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="bg-transparent outline-none text-white w-full"
              type="email"
              placeholder="Email"
              required
            />
          </div>
          <button
            disabled={loading}
            className={`w-full py-2.5 rounded-full text-white font-medium ${loading ? "bg-gray-500" : "bg-blue-600"}`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
