import clsx from "clsx";
import { lazy, Suspense } from "react";
import { Col, Container, Offcanvas, OffcanvasBody, OffcanvasHeader, OffcanvasTitle, Row } from "react-bootstrap";
import { FaSignOutAlt } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { STUDENT_MENU_ITEMS } from "@/assets/data/menu-items";
import useProfile from "@/hooks/useProfile";
import useToggle from "@/hooks/useToggle";
import useViewPort from "@/hooks/useViewPort";

const Footer = lazy(() => import("@/components/Footer"));
const Banner = lazy(() => import("@/components/studentLayoutComponents/Banner"));
const TopNavigationBar = lazy(() => import("@/components/studentLayoutComponents/TopNavigationBar"));

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
          return <Link className={clsx("list-group-item icons-center", {
            active: pathname === url
          })} to={url || ""} key={idx}>
            {Icon && <Icon className="me-2" />}
            {label}
          </Link>;
        })}
        <Link className="list-group-item text-danger bg-danger-soft-hover" onClick={logout} to="/home">
          <FaSignOutAlt className="fa-fw me-2" />
          Sign Out
        </Link>
      </div>
    </div>
  );
};

const StudentLayout = ({ children, isNested = false }) => {
  const { pathname } = useLocation();
  const { isTrue: isOffCanvasMenuOpen, toggle: toggleOffCanvasMenu } = useToggle();
  const { width } = useViewPort();

  const isFullscreen =
    pathname === "/student/video-player" ||
    /^\/courses\/[^/]+\/watch(\/[^/]+)?$/.test(pathname);

  if (isFullscreen) {
    return (
      <main className="bg-dark min-vh-100">
        <Suspense>{children}</Suspense>
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
            <Banner toggleOffCanvas={toggleOffCanvasMenu} />
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
                    <Suspense>{children}</Suspense>
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