import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function useEmailVerify(initialEmail = "", onVerifySuccess) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [userEmail, setUserEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (initialEmail) {
      setUserEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < inputRefs.current.length - 1)
      inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    const pasteArray = paste.split("").slice(0, 6);
    const newOtp = [...otp];
    pasteArray.forEach((char, i) => {
      newOtp[i] = char;
      if (inputRefs.current[i]) inputRefs.current[i].value = char;
    });
    setOtp(newOtp);
    const nextIndex = pasteArray.length >= 6 ? 5 : pasteArray.length;
    inputRefs.current[nextIndex].focus();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.error("Please enter 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      axios.defaults.withCredentials = true;
      
      const endpoint = `${backendUrl}/api/auth/verify-email`;
      const payload = { email: userEmail, otp: otpCode };

      const { data } = await axios.post(endpoint, payload);

      if (!data.success) {
        toast.error(data.message || "Invalid OTP");
        setOtp(new Array(6).fill(""));
        inputRefs.current[0].focus();
        return;
      }

      toast.success(data.message || "Email verified successfully!");

      if (onVerifySuccess) onVerifySuccess(userEmail);

    } catch (error) {
      if (error.response) {
        const { data } = error.response;
        toast.error(data?.message || "Verification Error");
      } else if (error.request) {
        // if network error (server is down or unreachable)
        toast.error("Unable to connect to server. Please try again later.");
      } else {
        // if unknown error
        console.log("Verify email error: ", error)
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    otp,
    inputRefs,
    userEmail,
    setUserEmail,
    loading,
    handleChange,
    handleKeyDown,
    handlePaste,
    onSubmit,
  };
}