
import { useDispatch } from 'react-redux';
import { Offcanvas, OffcanvasBody, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { BsGearFill, BsGlobe, BsPower } from 'react-icons/bs';
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
            <div className="px-3 mt-auto pt-3">
              <div className="d-flex align-items-center justify-content-between text-primary-hover">
                <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Settings</Tooltip>}>
                  <Link className="h5 mb-0 text-body" to="/admin-settings" data-bs-toggle="tooltip" data-bs-placement="top" title="Settings">
                    <BsGearFill />
                  </Link>
                </OverlayTrigger>

                <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Home</Tooltip>}>
                  <Link className="h5 mb-0 text-body" to="/dashboard" data-bs-toggle="tooltip" data-bs-placement="top" title="Home">
                    <BsGlobe />
                  </Link>
                </OverlayTrigger>

                <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Sign out</Tooltip>}>
                  <button
                    onClick={handleLogout}
                    className="text-body"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      lineHeight: '1',
                      cursor: 'pointer'
                    }}
                  >
                    <BsPower />
                  </button>
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
              <div className="px-3 mt-auto pt-3">
                <div className="d-flex align-items-center justify-content-between text-primary-hover">
                  <Link className="h5 mb-0 text-body" to="/admin-settings" data-bs-toggle="tooltip" data-bs-placement="top" title="Settings">
                    <BsGearFill />
                  </Link>
                  <Link className="h5 mb-0 text-body" to="/dashboard" data-bs-toggle="tooltip" data-bs-placement="top" title="Home">
                    <BsGlobe />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-body"
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      lineHeight: '1',
                      cursor: 'pointer'
                    }}
                  >
                    <BsPower />
                  </button>
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
)};

export default AdminLayout;