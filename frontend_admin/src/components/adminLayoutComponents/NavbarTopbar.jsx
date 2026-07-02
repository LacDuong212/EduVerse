import { useEffect, useState } from 'react';
import logoMobileLightImg from '@/assets/images/logo/logo_icon.svg';
import logoMobileImg from '@/assets/images/logo/logo_icon.svg';
import ProfileDropdown from './ProfileDropdown';
import { useLayoutContext } from '@/context/useLayoutContext';
import { Container } from 'react-bootstrap';
import { IoMenu } from 'react-icons/io5';
import { BsCalendar3, BsClock } from 'react-icons/bs';
import { Link } from 'react-router-dom';

const formatDateTime = (d) => ({
  weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
  date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
});

const NavbarTopbar = () => {
  const {
    appMenuControl
  } = useLayoutContext();
  const [dt, setDt] = useState(() => formatDateTime(new Date()));

  useEffect(() => {
    const timer = setInterval(() => setDt(formatDateTime(new Date())), 1000);
    return () => clearInterval(timer);
  }, []);
  return <nav className="navbar top-bar navbar-light border-bottom py-0 py-xl-3">
    <Container fluid className="px-0 py-2">
      <div className="d-flex align-items-center w-100">
        {/* <div className="d-flex align-items-center d-xl-none">
          <Link className="navbar-brand" to="/dashboard">
            <img className="light-mode-item navbar-brand-item h-30px w-auto" src={logoMobileImg} alt="logo Mobile" />
            <img className="dark-mode-item navbar-brand-item h-30px w-auto" src={logoMobileLightImg} alt="logo Mobile Light" />
          </Link>
        </div> */}
        <div className="navbar-expand-xl sidebar-offcanvas-menu me-2">
          <button className="navbar-toggler me-auto bg-body p-0" onClick={appMenuControl.toggle} data-bs-toggle="offcanvas" data-bs-target="#offcanvasSidebar" aria-controls="offcanvasSidebar" aria-expanded="false" aria-label="Toggle navigation" data-bs-auto-close="outside">
            <IoMenu className="bi bi-text-right fa-fw h2 lh-0 mb-0 rtl-flip" data-bs-target="#offcanvasMenu" />
          </button>
        </div>

        {/* Date & Time */}
        <div className="d-none d-lg-flex align-items-center gap-2 flex-grow-1 topbar-datetime">
          <span className="topbar-dt-chip topbar-dt-date">
            <BsCalendar3 className="topbar-dt-icon" />
            <span className="topbar-dt-weekday">{dt.weekday}</span>
            <span className="topbar-dt-sep">·</span>
            <span>{dt.date}</span>
          </span>
          <span className="topbar-dt-divider" />
          <span className="topbar-dt-chip topbar-dt-time">
            <BsClock className="topbar-dt-icon" />
            <span className="topbar-dt-hms">{dt.time}</span>
          </span>
        </div>

        <div className="d-flex align-items-center ms-auto">
          <ul className="navbar-nav flex-row align-items-center">
            <ProfileDropdown className="ms-2 ms-md-3" />
          </ul>
        </div>
      </div>
    </Container>
  </nav>;
};
export default NavbarTopbar;
