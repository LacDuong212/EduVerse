import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchAdminProfile, logoutAdmin } from '@/redux/adminSlice';
import logoImg from '@/assets/images/logo/logo_light.svg';
import AppMenu from '@/components/admin/AppMenu';
import { useLayoutContext } from '@/context/useLayoutContext';
import useViewPort from '@/hooks/useViewPort';
import { lazy } from 'react';
import { Offcanvas, OffcanvasBody, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { BsGearFill, BsGlobe, BsPower } from 'react-icons/bs';
import { Link, useNavigate } from 'react-router-dom';
const NavbarTopbar = lazy(() => import('@/components/adminLayoutComponents/NavbarTopbar'));

const AdminLayout = ({ children }) => {
  const { width } = useViewPort();
  const { appMenuControl } = useLayoutContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch admin profile
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      dispatch(fetchAdminProfile());
    }
  }, [dispatch]);

  // Logout
  const handleLogout = async () => {
    try {
      await dispatch(logoutAdmin()).unwrap();
      navigate('/admin/auth/sign-in');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };


  return <main>
    <nav className="navbar sidebar navbar-expand-xl navbar-dark bg-dark">
      <div className="d-flex align-items-center">
        <Link className="navbar-brand" to="/admin/dashboard">
          <img className="navbar-brand-item" src={logoImg} alt="logo" />
        </Link>
      </div>

      {width >= 1200 ? <div className="sidebar-content d-flex flex-column bg-dark">
        <AppMenu />
        <div className="px-3 mt-auto pt-3">
          <div className="d-flex align-items-center justify-content-between text-primary-hover">
            <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Settings</Tooltip>}>
              <Link className="h5 mb-0 text-body" to="/admin/admin-settings" data-bs-toggle="tooltip" data-bs-placement="top" title="Settings">
                <BsGearFill />
              </Link>
            </OverlayTrigger>
            <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Home</Tooltip>}>
              <Link className="h5 mb-0 text-body" to="/admin/dashboard" data-bs-toggle="tooltip" data-bs-placement="top" title="Home">
                <BsGlobe />
              </Link>
            </OverlayTrigger>
            <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Sign out</Tooltip>}>
              <button onClick={handleLogout} className="text-body"
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
      </div> : <Offcanvas className="flex-row custom-scrollbar h-100 " show={appMenuControl.open} placement="start" onHide={appMenuControl.toggle}>
        <OffcanvasBody className="admin-offcanvas-menu d-flex flex-column bg-dark">
          <AppMenu />
          <div className="px-3 mt-auto pt-3">
            <div className="d-flex align-items-center justify-content-between text-primary-hover">
              <Link className="h5 mb-0 text-body" to="/admin/admin-settings" data-bs-toggle="tooltip" data-bs-placement="top" title="Settings">
                <BsGearFill />
              </Link>
              <Link className="h5 mb-0 text-body" to="/admin/dashboard" data-bs-toggle="tooltip" data-bs-placement="top" title="Home">
                <BsGlobe />
              </Link>
              <button onClick={handleLogout} className="text-body"
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
      </Offcanvas>}
    </nav>
    <div className="page-content">
      <NavbarTopbar />
      <div className="page-content-wrapper border">{children}</div>
    </div>
  </main>;
};
export default AdminLayout;
