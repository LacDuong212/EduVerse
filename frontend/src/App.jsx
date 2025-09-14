import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import EmailVerify from "./pages/EmailVerify";
import Profile from "./pages/Account";
import ForgotPassword from "./pages/ForgotPassword";
import CheckResetOtp from "./pages/CheckResetOtp";
import ResetPassword from "./pages/ResetPassword";
import CourseDetail from "./pages/CourseDetail";

import { useDispatch } from "react-redux";
import { setLogin, setLogout } from "./redux/authSlice";
import { setCart } from "./redux/cartSlice";
import CartPage from "./pages/Cart";

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
    <div>
      <ToastContainer />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/check-reset-otp" element={<CheckResetOtp />} />
        <Route path="/account" element={<Profile />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/my-cart" element={<CartPage />} />

      </Routes>
    </div>
  );
};

export default App;
