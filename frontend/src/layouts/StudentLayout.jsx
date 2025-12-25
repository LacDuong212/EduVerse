import { STUDENT_MENU_ITEMS } from '../assets/data/menu-items';
import useProfile from '../hooks/useProfile';
import useToggle from '../hooks/useToggle';
import useViewPort from '../hooks/useViewPort';

import clsx from 'clsx';
import { lazy, Suspense } from 'react';
import { Col, Container, Offcanvas, OffcanvasBody, OffcanvasHeader, OffcanvasTitle, Row } from 'react-bootstrap';
import { FaSignOutAlt } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const Banner = lazy(() => import('../components/StudentLayoutComponents/Banner'));
const Footer = lazy(() => import('../components/Footer'));
const Preloader = lazy(() => import('../components/preloader'));
const TopNavigationBar = lazy(() => import('../components/StudentLayoutComponents/TopNavigationBar'));


const VerticalMenu = () => {
  const { pathname } = useLocation();
  const { logout } = useProfile();

  return (
    <div className="bg-dark border rounded-3 pb-0 p-3 w-100">
      <div className="list-group list-group-dark list-group-borderless">
        {STUDENT_MENU_ITEMS.map(({
          label,
          url,
          icon
        }, idx) => {
          const Icon = icon;
          return <Link className={clsx('list-group-item icons-center', {
            active: pathname === url
          })} to={url || ''} key={idx}>
            {Icon && <Icon className="me-2" />}
            {label}
          </Link>;
        })}
        <Link className="list-group-item text-danger bg-danger-soft-hover" onClick={logout} to="/">
          <FaSignOutAlt className="fa-fw me-2" />
          Sign Out
        </Link>
      </div>
    </div>
  );
};

const StudentLayout = ({ children, isNested = false }) => {
  const { user } = useProfile();
  const { width } = useViewPort();
  const { isTrue: isOffCanvasMenuOpen, toggle: toggleOffCanvasMenu } = useToggle();
  const { pathname } = useLocation();

  // Điều kiện full screen cho trang player
  const isFullscreen =
    pathname === '/student/video-player' ||
    /^\/courses\/[^/]+\/watch(\/[^/]+)?$/.test(pathname);

  // Nếu full screen: bỏ toàn bộ chrome, render thẳng nội dung
  if (isFullscreen) {
    return (
      <main className="bg-dark min-vh-100">
        <Suspense fallback={<Preloader />}>{children}</Suspense>
      </main>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Suspense>
        <TopNavigationBar />
      </Suspense>

      <main className="flex-grow-1">
        {isNested ? (
          <>
            <Banner toggleOffCanvas={toggleOffCanvasMenu} studentData={user} />
            <section className="pt-0">
              <Container>
                <Row>
                  <Col xl={3}>
                    {width >= 1200 ? <VerticalMenu /> : <Offcanvas show={isOffCanvasMenuOpen} placement="end" onHide={toggleOffCanvasMenu}>
                      <OffcanvasHeader className="bg-light" closeButton>
                        <OffcanvasTitle>My profile</OffcanvasTitle>
                      </OffcanvasHeader>
                      <OffcanvasBody className="p-3 p-xl-0">
                        <VerticalMenu />
                      </OffcanvasBody>
                    </Offcanvas>}
                  </Col>
                  <Col xl={9}>
                    <Suspense fallback={<Preloader />}>{children}</Suspense>
                  </Col>
                </Row>
              </Container>
            </section>
          </>
        ) : (
          <section className="py-0">
            {children}
          </section>
        )}
      </main>

      <Suspense>
        <Footer className={"bg-light pt-5"} />
      </Suspense>
    </div>
  );
};

export default StudentLayout;
