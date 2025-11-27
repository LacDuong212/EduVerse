import { useEffect, useState } from 'react';
import logoMobileLightImg from '@/assets/images/logo/logo_icon.svg';
import logoMobileImg from '@/assets/images/logo/logo_icon.svg';
import ProfileDropdown from './ProfileDropdown';
import { useLayoutContext } from '@/context/useLayoutContext';
import { Container } from 'react-bootstrap';
import { BsTextLeft } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';

const NavbarTopbar = () => {
  const {
    appMenuControl
  } = useLayoutContext();
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  );
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return <nav className="navbar top-bar navbar-light border-bottom py-0 py-xl-3">
    <Container fluid className="p-0">
      <div className="d-flex align-items-center w-100">
        <div className="d-flex align-items-center d-xl-none">
          <Link className="navbar-brand" to="/admin/dashboard">
            <img className="light-mode-item navbar-brand-item h-30px w-auto" src={logoMobileImg} alt="logo Mobile" />
            <img className="dark-mode-item navbar-brand-item h-30px w-auto" src={logoMobileLightImg} alt="logo Mobile Light" />
          </Link>
        </div>
        <div className="navbar-expand-xl sidebar-offcanvas-menu">
          <button className="navbar-toggler me-auto" onClick={appMenuControl.toggle} type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasSidebar" aria-controls="offcanvasSidebar" aria-expanded="false" aria-label="Toggle navigation" data-bs-auto-close="outside">
            <BsTextLeft className="bi bi-text-right fa-fw h2 lh-0 mb-0 rtl-flip" data-bs-target="#offcanvasMenu">

            </BsTextLeft>
          </button>
        </div>

        {/* Date & Time */}
        <div className="d-none d-lg-block text-muted fw-semibold  flex-grow-1">
          {currentTime}
        </div>

        {/* Notification & Profile */}
        <div className="d-flex align-items-center ms-auto">
          <ul className="navbar-nav flex-row align-items-center">
            <NotificationDropdown />
            <ProfileDropdown className="ms-2 ms-md-3" />
          </ul>
        </div>
      </div>
    </Container>
  </nav>;
};
export default NavbarTopbar;
