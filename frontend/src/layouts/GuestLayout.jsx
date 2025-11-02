import { lazy, Suspense } from 'react';
import { Container } from 'react-bootstrap';

const TopNavigationBar = lazy(() => import('../components/GuestLayoutComponents/TopNavigationBar'));
const Footer = lazy(() => import('../components/Footer'));
const Preloader = lazy(() => import('../components/Preloader'));

const GuestLayout = ({ children }) => {
  return (
    <>
      <Suspense fallback={<Preloader />}>
        <TopNavigationBar />
      </Suspense>

      <main>
        <section className="pt-0">
          <Container>{children}</Container>
        </section>
      </main>

      <Suspense fallback={<Preloader />}>
        <Footer className="bg-light pt-5" />
      </Suspense>
    </>
  );
};

export default GuestLayout;
