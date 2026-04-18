import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").min(0, "Email is required"),
});

export default function useForgotPassword(onForgotSuccess) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: emailFromUrl,
    },
  });

  const forgotPassword = handleSubmit(async (data) => {
    if (loading) return;
    setLoading(true);

    try {
      const payload = {
        email: data.email.toLowerCase().trim(),
      };

      const { data: resData } = await axios.post(
        `${backendUrl}/api/auth/forget-password`,
        payload,
        { withCredentials: true }
      );

      if (resData.success) {
        toast.success(resData.message || "OTP sent to your email!");

        if (onForgotSuccess) {
          onForgotSuccess(payload.email);
        }
      }
    } catch (error) {
      console.error("Forgot Password Error:", error);

      if (error.response) {
        const { status, data: errData } = error.response;

        if (status === 400 && errData.errors) {
          errData.errors.forEach((err) => {
            const fieldName = err.field.split('.').pop();
            setError(fieldName, { type: "server", message: err.message });
          });
          return;
        }

        if (status === 401) {
          toast.warning(errData.message || "Account must be verified first.");
          return;
        }

        toast.error(errData.message || "Something went wrong.");
      } else {
        toast.error("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  });

  return {
    loading,
    forgotPassword,
    control,
    errors
  };
}