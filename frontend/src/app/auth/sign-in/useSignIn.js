import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setLogin, setLogout } from "@/redux/authSlice";

import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from './signInSchema';

export default function useSignIn() {
  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [loading, setLoading] = useState(false);

  const login = handleSubmit(async (data) => {
    setLoading(true);
    try {
      axios.defaults.withCredentials = true;
      const response = await axios.post(`${backendUrl}/api/auth/login`, data);

      if (response.data.success) {
        let defaultRedirect = "/"
        try {
          const profile = await axios.get(`${backendUrl}/api/user/profile`);
          if (profile.data.success) {
            dispatch(setLogin(profile.data.user));
            defaultRedirect = profile.data.user?.role === "student"
              ? "/"
              : "/instructor/dashboard";
          } else {
            dispatch(setLogout());
          }
        } catch {
          dispatch(setLogout());
        }

        toast.success("Login successful!");

        const params = new URLSearchParams(location.search);
        const redirectTo = params.get("redirectTo") || defaultRedirect;
        navigate(redirectTo, { replace: true });
      } else {
        toast.error(response.data.message || "Invalid credentials");
      }
    } catch (err) {
      console.log(err)
      toast.error("Login failed. Please try again.");
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
