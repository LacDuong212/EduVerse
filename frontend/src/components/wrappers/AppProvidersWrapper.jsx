import FallbackLoading from '../FallbackLoading';
import { LayoutProvider } from '@/context/useLayoutContext';
import { NotificationProvider } from '@/context/useNotificationContext';

import Aos from 'aos';
import { Suspense, useEffect } from 'react';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const AppProvidersWrapper = ({ children }) => {
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
      />
    </LayoutProvider>
  );
};

export default AppProvidersWrapper;
