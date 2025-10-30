import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setLogin, setLogout } from "@/redux/authSlice";

export default function useSignIn() {
  const { control, handleSubmit, reset } = useForm();
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
        try {
          const profile = await axios.get(`${backendUrl}/api/user/profile`);
          if (profile.data.success) {
            dispatch(setLogin(profile.data.user));
          } else {
            dispatch(setLogout());
          }
        } catch {
          dispatch(setLogout());
        }

        toast.success("Login successful!");

        const params = new URLSearchParams(location.search);
        const redirectTo = params.get("redirectTo") || "/";
        navigate(redirectTo, { replace: true });
      } else {
        toast.error(response.data.message || "Invalid credentials");
      }
    } catch (err) {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
      reset();
    }
  });

  return {
    loading,
    login,
    control,
  };
}
