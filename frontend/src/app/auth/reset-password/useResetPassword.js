import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "./resetPasswordSchema";

export default function useResetPassword(email) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { handleSubmit, control, reset, setError, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      otp: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onResetPassword = handleSubmit(async (data) => {
    if (!email) {
      toast.error("Missing email session. Please try the forgot password step again.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/auth/reset-password`, {
        email: email.toLowerCase().trim(),
        otp: data.otp,
        newPassword: data.password,
      }, { withCredentials: true });

      if (response.data.success) {
        toast.success("Password reset successfully! You can now login.");
        reset();
        navigate("/auth/sign-in", { replace: true });
      }
    } catch (error) {
      console.error("Reset Password Error:", error);

      if (error.response) {
        const { status, data: errData } = error.response;

        if (status === 400 && errData.errors) {
          errData.errors.forEach((err) => {
            let fieldName = err.field.split(".").pop();
            if (fieldName === "newPassword") fieldName = "password";
            setError(fieldName, { type: "server", message: err.message });
          });
          return;
        }

        toast.error(errData.message || "Failed to reset password");
      } else {
        toast.error("Network error. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  });

  return {
    control,
    handleSubmit: onResetPassword,
    loading,
    errors
  };
}