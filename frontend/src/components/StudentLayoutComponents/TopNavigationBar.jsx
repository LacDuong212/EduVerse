import { STUDENT_APP_MENU_ITEMS, STUDENT_ACCOUNT_DROPDOWN_ITEMS } from '@/assets/data/menu-items.js';
import LogoBox from '@/components/LogoBox';
import TopNavbar from '@/components/TopNavbar';
import NotificationDropdown from '@/components/TopNavbar/components/NotificationDropdown'
import ProfileDropdown from '@/components/TopNavbar/components/ProfileDropdown';
import SimpleAppMenu from '@/components/TopNavbar/components/SimpleAppMenu';
import TopbarMenuToggler from '@/components/TopNavbar/components/TopbarMenuToggler';
import ShoppingCartDropdown from '@/components/TopNavbar/components/ShoppingCartDropdown';
import { useLayoutContext } from '@/context/useLayoutContext';
import { Container } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
const TopNavigationBar = () => {
  const { appMenuControl } = useLayoutContext();
  const cartCount = useSelector((state) => (state.cart?.items || []).length);
  const navigate = useNavigate();
  const onCartClick = (e) => {
    // Chặn Bootstrap dropdown toggle, điều hướng luôn
    e.preventDefault();
    e.stopPropagation();
    navigate('/student/cart');
  };
  return (
    <TopNavbar>
      <Container>
        <LogoBox width={130} />
        <TopbarMenuToggler />
        <SimpleAppMenu mobileMenuOpen={appMenuControl.open} menuClassName="mx-auto" topMenuItems={STUDENT_APP_MENU_ITEMS} />
        <ul className="nav flex-row align-items-center list-unstyled ms-xl-auto">
          <NotificationDropdown />
           <li
            className="nav-item ms-3 position-relative"
            onClickCapture={onCartClick} // click icon giỏ -> điều hướng
            style={{ cursor: 'pointer' }}
          >
            <ShoppingCartDropdown /> 
            <span
              className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-dark mt-xl-2 ms-n1"
              style={{ zIndex: 10, pointerEvents: 'none' }}
            >
              {cartCount}
            </span>
          </li>
          <ProfileDropdown className="nav-item ms-3" dropdownItems={STUDENT_ACCOUNT_DROPDOWN_ITEMS} />
        </ul>
      </Container>
    </TopNavbar>
  );
};

export default TopNavigationBar;
