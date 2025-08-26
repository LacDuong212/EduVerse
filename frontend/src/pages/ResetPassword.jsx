import React, { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const otp = location.state?.otp;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !otp) {
      toast.error("Missing email or OTP. Please restart the process.");
      navigate("/forgot-password");
      return;
    }

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const { data } = await axios.post(backendUrl + "/api/auth/reset-password", {
        email,
        otp,
        newPassword: password,
      });

      if (data.success) {
        toast.success("Password reset successfully. Please login.");
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0">
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          Reset Password
        </h2>
        <p className="text-center text-sm mb-6">Enter your new password</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-transparent outline-none text-white w-full"
            />
          </div>

          <div className="mb-6 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="bg-transparent outline-none text-white w-full"
            />
          </div>

          <button className="w-full py-2.5 rounded-full bg-blue-600 text-white font-medium">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;