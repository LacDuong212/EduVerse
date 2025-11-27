import { useEffect, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from "react-toastify";
import Aos from 'aos';
import "react-toastify/dist/ReactToastify.css";

import FallbackLoading from '../FallbackLoading';
import { LayoutProvider } from '@/context/useLayoutContext';
import { NotificationProvider } from '@/context/useNotificationContext';

import { checkAuth } from '@/redux/adminSlice';


const AppProvidersWrapper = ({ children }) => {
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

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

  if (loading) {
    return <FallbackLoading />;
  }

  return (
    <LayoutProvider>
      <NotificationProvider>
        <Suspense fallback={<FallbackLoading />}>
          {children}
        </Suspense>
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
