import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setLogin, setLogout } from "@/redux/authSlice";

import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from './signInSchema';

export default function useSignIn(onSignUpSuccess) {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: emailFromUrl,
      password: ''
    }
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [loading, setLoading] = useState(false);

  const login = handleSubmit(async (data) => {
    if (loading) return;
    setLoading(true);

    const payload = {
      email: data.email.trim(),
      password: data.password
    };

    try {
      axios.defaults.withCredentials = true;
      const response = await axios.post(`${backendUrl}/api/auth/login`, payload);

      if (response.data.success) {
        try {
          const profile = await axios.get(`${backendUrl}/api/user/profile`);
          if (profile.data.success) {
            dispatch(setLogin(profile.data.user));

            const roleRedirect = profile.data.user?.role === "student" ? "/" : "/instructor/dashboard";
            const redirectTo = searchParams.get("redirectTo") || roleRedirect;

            toast.success("Welcome back!");
            navigate(redirectTo, { replace: true });
          } else {
            throw new Error("Profile fetch failed");
          }
        } catch (profileError) {
          console.error("Profile load error:", profileError);
          dispatch(setLogout());
          toast.error("Sign in succeeded but failed to load profile.");
        }
      }
    } catch (err) {
      console.error("Sign in Error:", err);
      dispatch(setLogout());

      if (err.response) {
        const { status, data } = err.response;

        // if account not found
        if (status === 404) {
          toast.error("Account not found. Please sign up instead.");
          // redirect to sign up page and pass email
          navigate(`/auth/sign-up?email=${encodeURIComponent(payload.email)}`);
          return;
        }

        // if account exists but not verified (401 + needVerify)
        if (status === 401 && data.needVerify) {
          toast.warning("Account not verified. Sending new OTP...");

          try {
            const otpResponse = await axios.post(
              `${backendUrl}/api/auth/send-otp`,
              { email: payload.email },
              { withCredentials: true }
            );

            // check if OTP sent successfully
            if (otpResponse.data.success) {
              toast.success("New OTP sent! Please check your email.");

              // show verify the modal
              if (onSignUpSuccess) {
                onSignUpSuccess(payload.email);
              } else {
                // fallback
                navigate(`/auth/verify-email?email=${encodeURIComponent(payload.email)}`);
              }
            }
          } catch (otpError) {
            console.error("OTP Resend Failed", otpError);
            toast.error("Failed to resend OTP. Please try again later.");
          }
          return;
        }

        // if account blocked (403)
        if (status === 403) {
          toast.error(data.message || "Your account has been restricted.");
          return;
        }

        // if wrong credentials (401)
        toast.error(data.message || "Invalid email or password.");
      } else if (err.request) {
        // if network error (server is down or unreachable)
        toast.error("Unable to connect to server. Please try again later.");
      } else {
        // if unknown error
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  });

  return {
    loading,
    login,
    control,
  };
}
