import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setLogin } from "@/redux/authSlice";

export default function useSignUp(onSignUpSuccess) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [loading, setLoading] = useState(false);

  const signUp = async ({ name, email, password }) => {
    if (loading) return;
    setLoading(true);

    try {
      axios.defaults.withCredentials = true;

      const { data } = await axios.post(`${backendUrl}/api/auth/register`, {
        name,
        email,
        password,
      });

      if (!data.success) {
        toast.error(data.message || "Registration failed");
        return;
      }

      toast.success("Registration successful! Please verify your email.");

      if (onSignUpSuccess) onSignUpSuccess(email);
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return { loading, signUp };
}
