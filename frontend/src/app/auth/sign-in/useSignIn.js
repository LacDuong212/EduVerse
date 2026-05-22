import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { setLogin, setLogout } from "@/redux/authSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "./signInSchema";

export default function useSignIn(onSignUpSuccess) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoggedIn, userData } = useSelector((state) => state.auth);

  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: emailFromUrl,
      password: ""
    }
  });

  useEffect(() => {
    if (isLoggedIn === true && userData) {
      const roleRedirect = userData.role === "student" ? "/home" : "/instructor/dashboard";
      const redirectTo = searchParams.get("redirectTo") || roleRedirect;

      navigate(redirectTo, { replace: true });
    }
  }, [isLoggedIn, userData, navigate, searchParams]);

  const login = handleSubmit(async (data) => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/auth/login`, data, {
        withCredentials: true
      });

      if (response.data.success) {
        const user = response.data.result;
        dispatch(setLogin(user));
        toast.success("Welcome back!");

        const roleRedirect = user.role === "student" ? "/home" : "/instructor/dashboard";
        const redirectTo = searchParams.get("redirectTo") || roleRedirect;
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      console.error("Sign in Error:", err);
      dispatch(setLogout());

      if (err.response) {
        const { status, data: errData } = err.response;

        if (status === 400 && errData.errors) {
          errData.errors.forEach((error) => {
            const fieldName = error.field.split('.').pop();
            setError(fieldName, { type: "server", message: error.message });
          });
          return;
        }

        if (status === 404) {
          toast.error(errData.message || "Account not found.");
          navigate(`/auth/sign-up?email=${encodeURIComponent(data.email)}`);
          return;
        }

        if (status === 401 && errData.errors?.needVerify) {
          handleVerification(data.email);
          return;
        }

        toast.error(errData.message || "Invalid credentials.");
      } else {
        toast.error("Unable to connect to server.");
      }
    } finally {
      setLoading(false);
    }
  });

  const handleVerification = async (email) => {
    toast.warning("Account not verified. Sending verification OTP...");
    try {
      const res = await axios.post(`${backendUrl}/api/auth/resend-otp`, { email }, { withCredentials: true });
      if (res.data.success) {
        toast.success("New OTP sent!");
        onSignUpSuccess ? onSignUpSuccess(email) : navigate(`/auth/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch {
      toast.error("Failed to resend OTP.");
    }
  };

  return {
    loading,
    login,
    control,
    errors,
  };
}