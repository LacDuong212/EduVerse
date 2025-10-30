import Aos from 'aos';
import { Suspense, useEffect } from 'react';

import FallbackLoading from '../FallbackLoading';
import { LayoutProvider } from '@/context/useLayoutContext';
import { NotificationProvider } from '@/context/useNotificationContext';


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
    </LayoutProvider>
  );
};

export default AppProvidersWrapper;
