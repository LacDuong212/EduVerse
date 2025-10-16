import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { setUserData } from "@/redux/authSlice";

export default function useEmailVerify(initialEmail = "") {
  axios.defaults.withCredentials = true;
  const dispatch = useDispatch();

  const [userEmail, setUserEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(new Array(6).fill(""));
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
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const { data } = await axios.post(`${backendUrl}/api/auth/verify-otp`, {
        email: userEmail,
        otp: otpCode,
      });

      if (data.success) {
        toast.success(data.message);
        dispatch(setUserData(data.user));
      } else {
        toast.error(data.message);
        setOtp(new Array(6).fill(""));
        inputRefs.current[0].focus();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    }
  };

  return {
    otp,
    inputRefs,
    userEmail,
    setUserEmail,
    handleChange,
    handleKeyDown,
    handlePaste,
    onSubmit,
  };
}