
import { useDispatch } from 'react-redux';
import { Button, Offcanvas, OffcanvasBody, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { BsGearFill, BsGlobe, BsPower } from 'react-icons/bs';
import { FaHome, FaPowerOff } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

import { logoutAdmin } from '@/redux/adminSlice';
import logoImg from '@/assets/images/logo/logo_light.svg';
import AppMenu from '@/components/admin/AppMenu';
import NavbarTopbar from '@/components/adminLayoutComponents/NavbarTopbar';
import { useLayoutContext } from '@/context/useLayoutContext';
import useViewPort from '@/hooks/useViewPort';

const AdminLayout = ({ children }) => {
  const { width } = useViewPort();
  const { appMenuControl } = useLayoutContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logoutAdmin()).unwrap();
      navigate('/auth/sign-in');
    } catch (err) {
      console.error('Logout failed:', err);
      navigate('/auth/sign-in');
    }
  };

  return (
    <main>
      <nav className="navbar sidebar navbar-expand-xl navbar-dark bg-dark">
        <div className="d-flex align-items-center">
          <Link className="navbar-brand" to="/dashboard">
            <img className="navbar-brand-item" src={logoImg} alt="logo" />
          </Link>
        </div>

        {width >= 1200 ? (
          <div className="sidebar-content d-flex flex-column bg-dark">
            <AppMenu />
            <div className="mt-auto">
              <div className="d-flex align-items-center justify-content-center gap-5 text-primary-hover">
                <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Settings</Tooltip>}>
                  <Link className="h5 mb-0" to="/settings" data-bs-toggle="tooltip" data-bs-placement="top" title="Settings">
                    <BsGearFill />
                  </Link>
                </OverlayTrigger>
                <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Home</Tooltip>}>
                  <Link className="h5 mb-0" to="/dashboard" data-bs-toggle="tooltip" data-bs-placement="top" title="Home">
                    <FaHome />
                  </Link>
                </OverlayTrigger>
                <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Sign Out</Tooltip>}>
                  <Button
                    onClick={handleLogout}
                    variant="outline-danger"
                    className="fs-5 p-0 mb-0 bg-transparent border-0"
                  >
                    <FaPowerOff />
                  </Button>
                </OverlayTrigger>
              </div>
            </div>
          </div>
        ) : (
          <Offcanvas
            className="flex-row custom-scrollbar h-100"
            style={{ width: "fit-content" }}
            show={appMenuControl.open}
            placement="start"
            onHide={appMenuControl.toggle}
          >
            <OffcanvasBody className="admin-offcanvas-menu d-flex flex-column bg-dark">
              <AppMenu />
              <div className="mt-auto">
                <div className="d-flex align-items-center justify-content-center gap-4 text-primary-hover">
                  <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Settings</Tooltip>}>
                    <Link className="h5 mb-0" to="/settings" data-bs-toggle="tooltip" data-bs-placement="top" title="Settings">
                      <BsGearFill />
                    </Link>
                  </OverlayTrigger>
                  <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Home</Tooltip>}>
                    <Link className="h5 mb-0" to="/dashboard" data-bs-toggle="tooltip" data-bs-placement="top" title="Home">
                      <FaHome />
                    </Link>
                  </OverlayTrigger>
                  <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Sign Out</Tooltip>}>
                    <Button
                      onClick={handleLogout}
                      variant="outline-danger"
                      className="fs-5 p-0 mb-0 bg-transparent border-0"
                    >
                      <FaPowerOff />
                    </Button>
                  </OverlayTrigger>
                </div>
              </div>
            </OffcanvasBody>
          </Offcanvas>
        )}
      </nav>

      <div className="page-content">
        <NavbarTopbar />
        <div className="page-content-wrapper border">{children}</div>
      </div>
    </main>
  )
};

export default AdminLayout;