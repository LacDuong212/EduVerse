import FallbackLoading from '../FallbackLoading';
import { LayoutProvider } from '@/context/useLayoutContext';
import { NotificationProvider } from '@/context/useNotificationContext';

import Aos from 'aos';
import { Suspense, useEffect } from 'react';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setLogin, setLogout } from '@/redux/authSlice';
import { fetchWishlist } from '@/redux/wishlistSlice';
import { fetchCartCount } from '@/redux/cartSlice';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const AppProvidersWrapper = ({ children }) => {
  const dispatch = useDispatch();

  const { userData } = useSelector((state) => state.auth);
  const { status: wishlistStatus } = useSelector((state) => state.wishlist);
  const { status: cartStatus } = useSelector((state) => state.cart);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/auth/is-auth`,
          { withCredentials: true }
        );

        if (response.data.success) {
          dispatch(setLogin(response.data.user));
        } else {
          dispatch(setLogout());
        }
      } catch (error) {
        dispatch(setLogout());
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  useEffect(() => {
    if (userData?._id) {
      if (wishlistStatus === 'idle') {
        dispatch(fetchWishlist(userData._id));
      }

      if (cartStatus === 'idle') {
        dispatch(fetchCartCount());
      }
    }
  }, [userData, wishlistStatus, cartStatus, dispatch]);

  useEffect(() => {
    Aos.init();

    if (document) {
      const e = document.querySelector('#__next_splash');

      if (e?.hasChildNodes()) {
        document.querySelector('#splash-screen')?.classList.add('remove');
      }

      e?.addEventListener('DOMNodeInserted', () => {
        document.querySelector('#splash-screen')?.classList.add('remove');
      });
    }
  }, []);

  return (
    <LayoutProvider>
      <NotificationProvider>
        <Suspense fallback={<FallbackLoading />}>{children}</Suspense>
      </NotificationProvider>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        style={{ pointerEvents: 'auto' }}
      />
    </LayoutProvider>
  );
};

export default AppProvidersWrapper;
