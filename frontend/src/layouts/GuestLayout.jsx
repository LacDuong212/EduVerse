import { lazy, Suspense } from 'react';

const TopNavigationBar = lazy(() => import('../components/guestLayoutComponents/TopNavigationBar'));
const Footer = lazy(() => import('../components/Footer'));
const Preloader = lazy(() => import('../components/preloader'));

const GuestLayout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Suspense fallback={<Preloader />}>
        <TopNavigationBar />
      </Suspense>

      <main className="flex-grow-1">
        <section className="pt-0">
          {children}
        </section>
      </main>

      <Suspense fallback={<Preloader />}>
        <Footer className="bg-light pt-5" />
      </Suspense>
    </div>
  );
};

export default GuestLayout;
