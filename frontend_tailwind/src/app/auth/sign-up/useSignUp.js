import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { setLogin } from "@/redux/authSlice";

export default function useSignUp() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [loading, setLoading] = useState(false);

  const signUp = async ({ name, email, password }) => {
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

      dispatch(setLogin({ name, email }));
      navigate("/email-verify", { state: { email } });
      toast.success("Registration successful! Please verify your email.");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return { loading, signUp };
}
