import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import SignInPage from "./app/auth/sign-in/SignInPage";
import SignUpPage from "./app/auth/sign-up/SignUpPage";
import ForgotPasswordPage from "./app/auth/forgot-password/ForgotPasswordPage";
import ResetPasswordPage from "./app/auth/reset-password/ResetPasswordPage";

import { useDispatch } from "react-redux";
import { setLogin, setLogout } from "./redux/authSlice";
import { setCart } from "./redux/cartSlice";
import '@/assets/scss/style.scss';


axios.defaults.withCredentials = true; // ? set globally once

const App = () => {
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // fetch user profile
        const { data } = await axios.get(`${backendUrl}/api/user/profile`);
        if (data.success) {
          dispatch(setLogin(data.user));
        } else {
          dispatch(setLogout());
        }

        // fetch cart items
        const cartRes = await axios.get(`${backendUrl}/api/cart`);
        if (cartRes.data.success) {
          dispatch(setCart(cartRes.data.cart));
        }

      } catch (err) {
        dispatch(setLogout());
      }
    };

    fetchUser();
  }, [dispatch, backendUrl]);

  return (
    <>
    <Routes>
      <Route path="/auth/sign-in" element={<SignInPage />} />
      <Route path="/auth/sign-up" element={<SignUpPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
    </Routes>
    <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </>
     
  );
};

export default App;
