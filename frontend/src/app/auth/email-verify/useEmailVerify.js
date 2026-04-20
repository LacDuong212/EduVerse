import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

export default function useEmailVerify(initialEmail = "", onVerifySuccess) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [userEmail, setUserEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (initialEmail) setUserEmail(initialEmail);
  }, [initialEmail]);

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/[^0-9]/g, "");

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);

    setOtp(newOtp);

    if (val && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    const pasteArray = paste.split("").slice(0, 6);

    const newOtp = [...otp];
    pasteArray.forEach((char, i) => {
      newOtp[i] = char;
    });

    setOtp(newOtp);

    const nextIndex = Math.min(pasteArray.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const onSubmit = async (e) => {
    if (e) e.preventDefault();

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      return toast.info("Please enter the full 6-digit code");
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/verify-email`,
        { email: userEmail.toLowerCase().trim(), otp: otpCode },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message || "Email verified! You can now log in.");

        if (onVerifySuccess) {
          onVerifySuccess(userEmail);
        }
      }
    } catch (error) {
      console.error("Verification Error:", error);

      if (error.response) {
        const { status, data: errData } = error.response;

        if (status === 400 && errData.errors) {
          const mainError = errData.errors[0]?.message || "Invalid input";
          toast.error(mainError);
        } else {
          toast.error(errData.message || "Verification failed");
        }

        setOtp(new Array(6).fill(""));
        inputRefs.current[0]?.focus();
      } else {
        toast.error("Network error. Please try again.");
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