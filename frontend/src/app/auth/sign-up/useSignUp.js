import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "./signUpSchema";

export default function useSignUp(onSignUpSuccess) {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

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
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: emailFromUrl,
      password: "",
      confirmPassword: ""
    }
  });

  useEffect(() => {
    if (isLoggedIn && userData) {
      const roleRedirect = userData.role === "student" ? "/" : "/instructor/dashboard";
      navigate(roleRedirect, { replace: true });
    }
  }, [isLoggedIn, userData, navigate]);

  const signUp = handleSubmit(async (data) => {
    if (loading) return;
    setLoading(true);

    const payload = {
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      password: data.password
    };

    try {
      const { data: resData } = await axios.post(
        `${backendUrl}/api/auth/register`,
        payload,
        { withCredentials: true }
      );

      if (resData.success) {
        toast.success("Account created! Please check your email for the OTP.");

        if (onSignUpSuccess) {
          onSignUpSuccess(payload.email);
        } else {
          navigate(`/auth/verify-email?email=${encodeURIComponent(payload.email)}`);
        }
      }
    } catch (error) {
      console.error("Registration Error:", error);

      if (error.response) {
        const { status, data: errData } = error.response;

        if (status === 400 && errData.errors) {
          errData.errors.forEach((err) => {
            const fieldName = err.field.split(".").pop();
            setError(fieldName, { type: "server", message: err.message });
          });
          return;
        }

        if (status === 409) {
          toast.info("Account already exists. Redirecting to login...");
          navigate(`/auth/sign-in?email=${encodeURIComponent(payload.email)}`);
          return;
        }

        toast.error(errData.message || "Registration failed");
      } else {
        toast.error("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  });

  return {
    loading,
    signUp,
    control,
    errors
  };
}