import Aos from "aos";
import axios from "axios";
import { Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Preloader from "@/components/Preloader";
import GlobalPreloader from "@/components/GlobalPreloader";
import { PreloaderProvider } from "@/contexts/PreloaderContext";
import { SocketContextProvider } from "@/contexts/SocketContext";
import { LayoutProvider } from "@/contexts/useLayoutContext";
import { NotificationProvider } from "@/contexts/useNotificationContext";
import { setLogin, setLogout } from "@/redux/authSlice";
import { fetchCart } from "@/redux/cartSlice";
import { fetchWishlist } from "@/redux/wishlistSlice";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const AppProvidersWrapper = ({ children }) => {
  const dispatch = useDispatch();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const { userData } = useSelector((state) => state.auth);
  const { status: cartStatus } = useSelector((state) => state.cart);
  const { status: wishlistStatus } = useSelector((state) => state.wishlist);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/auth/status`,
          { withCredentials: true }
        );

        if (data.success) {
          dispatch(setLogin(data.result));
        } else {
          dispatch(setLogout());
        }
      } catch (error) {
        dispatch(setLogout());
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  useEffect(() => {
    if (isCheckingAuth) return;

    if (userData?.userId && userData?.role === "student") {
      if (cartStatus === "idle") {
        dispatch(fetchCart());
      }

      if (wishlistStatus === "idle") {
        dispatch(fetchWishlist());
      }
    }
  }, [userData, wishlistStatus, cartStatus, dispatch, isCheckingAuth]);

  useEffect(() => {
    Aos.init();

    if (document) {
      const e = document.querySelector("#__next_splash");

      if (e?.hasChildNodes()) {
        document.querySelector("#splash-screen")?.classList.add("remove");
      }

      e?.addEventListener("DOMNodeInserted", () => {
        document.querySelector("#splash-screen")?.classList.add("remove");
      });
    }
  }, []);

  return (
    <PreloaderProvider>
      <GlobalPreloader />
      <LayoutProvider>
        <NotificationProvider>
          <SocketContextProvider>
            <Suspense fallback={<Preloader />}>{children}</Suspense>
          </SocketContextProvider>
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
          style={{ pointerEvents: "auto" }}
        />
      </LayoutProvider>
    </PreloaderProvider>
  );
};

export default AppProvidersWrapper;