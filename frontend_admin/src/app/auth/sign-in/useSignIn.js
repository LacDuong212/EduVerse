import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";

import { loginAdmin } from "@/redux/adminSlice";

import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from './signInSchema';

export default function useSignIn() {
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const login = handleSubmit(async (data) => {
    setLoading(true);
    try {
      await dispatch(loginAdmin(data)).unwrap();

      toast.success("Login successful!");

      const params = new URLSearchParams(location.search);

      const redirectTo = params.get("redirectTo") || "/dashboard";

      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err || "Login failed. Please try again.");
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
