import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { setUserData } from "@/redux/authSlice";

export default function useEmailVerify(initialEmail = "", mode = "register", onVerifySuccess) {
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [userEmail, setUserEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoadinng] = useState(false);
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
      setLoadinng(true);
      axios.defaults.withCredentials = true;
      
      const { data } = await axios.post(`${backendUrl}/api/admin/verify-otp`, {
        email: userEmail,
        otp: otpCode,
      });

      if (!data.success) {
        toast.error(data.message || "Invalid OTP");
        setOtp(new Array(6).fill(""));
        inputRefs.current[0].focus();
        return;
      }

      toast.success(data.message || "OTP verified successfully");

      if (mode === "register") {
        const res = await axios.post(`${backendUrl}/api/admin/verify-account`, { email: userEmail });
        if (res.data.success) {
          toast.success(res.data.message || "Account verified");
          if (onVerifySuccess) onVerifySuccess(userEmail);
        } else {
          toast.error(res.data.message || "Failed to verify account");
        }
      } else if (mode === "forgot") {
        if (onVerifySuccess) onVerifySuccess(userEmail);
      }

    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setLoadinng(false);
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