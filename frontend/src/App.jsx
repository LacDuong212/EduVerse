import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./app/auth/components/AuthLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import EmailVerify from "./pages/EmailVerify";
import Profile from "./pages/Account";
import ForgotPassword from "./pages/ForgotPassword";
import CheckResetOtp from "./pages/CheckResetOtp";
import ResetPassword from "./pages/ResetPassword";
import CourseDetail from "./pages/CourseDetail";
import CartPage from "./pages/Cart";
import MyCourses from "./pages/MyCourses";
import ViewedCourses from "./pages/ViewedCourses";
import SignInPage from "./app/auth/sign-in/SignInPage";
import SignUpPage from "./app/auth/sign-up/SignUpPage";

import { useDispatch } from "react-redux";
import { setLogin, setLogout } from "./redux/authSlice";
import { setCart } from "./redux/cartSlice";
import CourseList from "./pages/CourseList";
import InstructorDashboard from "./pages/InstructorDashBoard";


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
      {/* Nhóm có Navbar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/account" element={<Profile />} />
        <Route path="/instructor" element={<InstructorDashboard />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/my-cart" element={<CartPage />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/viewed-courses" element={<ViewedCourses />} />
      </Route>

      <Route path="/auth/sign-in" element={<SignInPage />} />
      <Route path="/auth/sign-up" element={<SignUpPage />} />
      <Route path="/email-verify" element={<EmailVerify />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/check-reset-otp" element={<CheckResetOtp />} />
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
