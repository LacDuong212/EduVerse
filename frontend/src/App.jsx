import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AppRouter from "./routes/router"; 

import { useDispatch } from "react-redux";
import { setLogin, setLogout } from "./redux/authSlice";
import { setCart } from "./redux/cartSlice";
import '@/assets/scss/style.scss';


axios.defaults.withCredentials = true; // ? set globally once

const App = () => {
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       // fetch user profile
  //       const { data } = await axios.get(`${backendUrl}/api/user/profile`);
  //       if (data.success) {
  //         dispatch(setLogin(data.user));
  //       } else {
  //         dispatch(setLogout());
  //       }

  //       // fetch cart items
  //       const cartRes = await axios.get(`${backendUrl}/api/cart`);
  //       if (cartRes.data.success) {
  //         dispatch(setCart(cartRes.data.cart));
  //       }

  //     } catch (err) {
  //       dispatch(setLogout());
  //     }
  //   };

  //   fetchUser();
  // }, [dispatch, backendUrl]);

  return (
    <>
      <AppRouter />
      
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
