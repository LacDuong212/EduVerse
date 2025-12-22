
import { GUEST_APP_MENU_ITEMS } from '@/assets/data/menu-items.js';
import LogoBox from '@/components/LogoBox';
import TopNavbar from '@/components/TopNavBar';
import SimpleAppMenu from '@/components/TopNavBar/components/SimpleAppMenu';
import { useLayoutContext } from '@/context/useLayoutContext';
import { Container } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
const TopNavigationBar = () => {
  const { appMenuControl } = useLayoutContext();
  const navigate = useNavigate();

  const onLogoClick = (e) => {
    e.preventDefault();
    navigate('/home');
  };
  const onCartClick = (e) => {
    // Chặn Bootstrap dropdown toggle, điều hướng luôn
    e.preventDefault();
    e.stopPropagation();
    navigate('/student/cart');
  };
  return (
    <TopNavbar>
      <Container >
        {/* ✅ Logo */}
        <div onClick={onLogoClick} style={{ cursor: 'pointer' }}>
          <LogoBox width={130} />
        </div>

        {/* ✅ Menu giữa */}
        <SimpleAppMenu
          mobileMenuOpen={appMenuControl.open}
          menuClassName="mx-auto"
          topMenuItems={GUEST_APP_MENU_ITEMS}
        />

        {/* ✅ Nút Login / Register */}
        <div className="d-flex align-items-center ms-xl-auto pt-1">
          <Button
            variant="outline-primary"
            className="me-2 d-flex align-items-center"
            onClick={() => navigate('/auth/sign-in')}
          >
            Sign-in
          </Button>
          <Button
            variant="primary"
            className="d-flex align-items-center"
            onClick={() => navigate('/auth/sign-up')}
          >
            Sign-up
          </Button>
        </div>
      </Container>
    </TopNavbar>
  );
};

export default TopNavigationBar;
