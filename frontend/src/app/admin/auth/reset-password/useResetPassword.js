import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const schema = yup.object({
  password: yup.string().required("Please enter a new password").min(6, "At least 6 characters"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords do not match")
    .required("Please confirm your password"),
});

export default function useResetPassword(email) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const { handleSubmit, control, reset } = useForm({
    resolver: yupResolver(schema),
  });

  const resetPassword = async (data) => {
    if (!email) {
      toast.error("Missing email for password reset!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/admin/reset-password`, {
        email,
        newPassword: data.password,
      });

      if (response.data.success) {
        toast.success("Password reset successfully!");
        reset();
        navigate("/admin/auth/sign-in");
      } else {
        toast.error(response.data.message || "Password reset failed!");
      }
    } catch (error) {
      toast.error("An error occurred while resetting password");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { control, handleSubmit, resetPassword, loading };
}
