import { INSTRUCTOR_MENU_ITEMS } from '../assets/data/menu-items';
import Banner from '../components/instructorLayoutComponents/Banner';
import Footer from '../components/instructorLayoutComponents/Footer';
import TopNavigationBar from '../components/instructorLayoutComponents/TopNavigationBar';
import { useAuthContext } from '../context/useAuthContext';
import { useLayoutContext } from '../context/useLayoutContext';
import useToggle from '../hooks/useToggle';
import useViewPort from '../hooks/useViewPort';

import clsx from 'clsx';
import { Col, Container, Offcanvas, OffcanvasBody, OffcanvasHeader, OffcanvasTitle, Row } from 'react-bootstrap';
import { FaSignOutAlt } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';


const VerticalMenu = () => {
  const { pathname } = useLocation();
  const { removeSession } = useAuthContext();

  return (
    <div className="bg-dark border rounded-3 p-3 mb-5">
      <div className="list-group list-group-dark list-group-borderless">
        {INSTRUCTOR_MENU_ITEMS.map(
          ({ label, url, icon }, idx) => {
            const Icon = icon;
            return (
              <Link className={clsx('list-group-item icons-center', { active: pathname === url })} to={url || ''} key={idx}>
                {Icon && <Icon size={18} className="flex-shrink-0 me-2" />}
                <span style={{ position: 'relative', top: '2px' }}>{label}</span>
              </Link>
            );
          }
        )}

        {/* <Link className="list-group-item text-danger bg-danger-soft-hover" onClick={removeSession} to="/auth/sign-in"> */}
        <Link className="list-group-item text-danger bg-danger-soft-hover" onClick={null} to="/auth/sign-in">
          <FaSignOutAlt className="flex-shrink-0 ms-1 me-2" />
          <span style={{ position: 'relative', top: '2px' }}>Sign Out</span>
        </Link>
      </div>
    </div>
  );
};

const InstructorLayout = ({ children, isNested = false }) => {
  const { width } = useViewPort();
  const { } = useLayoutContext();
  const { isTrue: isOffCanvasMenuOpen, toggle: toggleOffCanvasMenu } = useToggle();

  const instructorData = {
    name: 'Duckle Munchkin',
    email: 'duckle.munchkin@example.com',
    pfpImg: 'https://res.cloudinary.com/dw1fjzfom/image/upload/v1761585729/7bd60af2-97e7-4c08-a35f-5a614d92052d.png'
  };

  return (
    <>
      <TopNavigationBar />

      <main>
        {isNested ? (
          <>
            <Banner toggleOffCanvas={toggleOffCanvasMenu} accountData={instructorData} />
            <section className="py-0">
              <Container>
                <Row>
                  <Col xl={3}>
                    {width >= 1200 ? <VerticalMenu /> : (
                      <Offcanvas show={isOffCanvasMenuOpen} placement="end" onHide={toggleOffCanvasMenu}>
                        <OffcanvasHeader className="bg-light" closeButton>
                          <OffcanvasTitle>Menu</OffcanvasTitle>
                        </OffcanvasHeader>
                        <OffcanvasBody className="p-2">
                          <VerticalMenu />
                        </OffcanvasBody>
                      </Offcanvas>
                    )}
                  </Col>
                  <Col xl={9}>{children}</Col>
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

      <Footer />
    </>
  );
};

export default InstructorLayout;
