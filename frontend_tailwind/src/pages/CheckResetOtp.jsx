import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

const CheckResetOtp = () => {
  const [email, setEmail] = useState("");
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const backendUrl = import.meta.env.VITE_BACKEND_URL

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const arr = paste.split("");
    arr.forEach((char, idx) => {
      if (inputRefs.current[idx]) {
        inputRefs.current[idx].value = char;
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map((el) => el.value || "");
    const otp = otpArray.join("");

    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits");
      return;
    }

    try {
      const { data } = await axios.post(backendUrl + "/api/auth/check-reset-otp", {
        email,
        otp,
      });

      if (data.success) {
        toast.success("OTP verified. Please enter your new password.");
        navigate("/reset-password", { state: { email, otp } });
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
          Verify OTP
        </h2>
        <p className="text-center text-sm mb-6">
          Enter the OTP sent to your email
        </p>

        <form onSubmit={handleSubmit}>
          {!location.state?.email && (
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-transparent outline-none text-white w-full"
              />
            </div>
          )}

          <div className="flex justify-between mb-6" onPaste={handlePaste}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  required
                  className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
                  ref={(el) => (inputRefs.current[index] = el)}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              ))}
          </div>

          <button className="w-full py-2.5 rounded-full bg-blue-600 text-white font-medium">
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckResetOtp;
