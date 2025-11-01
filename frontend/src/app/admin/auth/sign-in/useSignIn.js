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
      // Gửi thông tin đăng nhập
      const response = await axios.post(`${backendUrl}/api/admin/login`, data);

      if (!response.data.success) {
        toast.error(response.data.message || "Invalid credentials");
        return;
      }

      const adminToken = response.data.token;
      if (!adminToken) {
        toast.error("No token received from server");
        return;
      }

      // Lưu token để tái sử dụng
      localStorage.setItem("adminToken", adminToken);

      // Gọi API lấy thông tin admin
      const profile = await axios.get(`${backendUrl}/api/admin/profile`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (profile.data.success) {
        dispatch(setLogin(profile.data.admin));
        toast.success("Login successful!");
        navigate("/admin/dashboard");
      } else {
        dispatch(setLogout());
        toast.error("Failed to fetch admin profile");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      toast.error("Login failed. Please try again.");
      dispatch(setLogout());
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
