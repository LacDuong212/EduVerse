import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function useSignUp(onSignUpSuccess) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const signUp = async ({ name, email, password }) => {
    if (loading) return;
    setLoading(true);

    const payload = {
      name,
      email: email.trim(),
      password
    };

    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backendUrl}/api/auth/register`, payload);

      if (data.success) {
        toast.success("Registration successful! Please verify your email.");

        // open verify email modal
        if (onSignUpSuccess) {
          onSignUpSuccess(payload.email);
        } else {
          // fallback: redirect to verify page and pass email
          navigate(`/auth/verify-email?email=${encodeURIComponent(payload.email)}`);
        }
      } else {
        toast.error(data.message || "Registration failed");
      }

    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;

        // if account already exists
        if (status === 409) {
          toast.info("Account already exists. Please log in.");
          // redirect to sign in page and pass email
          navigate(`/auth/sign-in?email=${encodeURIComponent(payload.email)}`);
          return;
        }

        toast.error(data.message || "Registration failed");
      } else {
        toast.error("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { loading, signUp };
}
