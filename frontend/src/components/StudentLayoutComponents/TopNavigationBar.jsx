import { STUDENT_APP_MENU_ITEMS, STUDENT_ACCOUNT_DROPDOWN_ITEMS } from '@/assets/data/menu-items.js';
import LogoBox from '@/components/LogoBox';
import TopNavbar from '@/components/TopNavbar';
import NotificationDropdown from '@/components/TopNavbar/components/NotificationDropdown'
import ProfileDropdown from '@/components/TopNavbar/components/ProfileDropdown';
import SimpleAppMenu from '@/components/TopNavbar/components/SimpleAppMenu';
import TopbarMenuToggler from '@/components/TopNavbar/components/TopbarMenuToggler';
import { useLayoutContext } from '@/context/useLayoutContext';

import { Container } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router";
import { CiHeart } from "react-icons/ci";
import { BsCart3 } from 'react-icons/bs';

const TopNavigationBar = () => {
  const { appMenuControl } = useLayoutContext();
  const navigate = useNavigate();

  const cartCount = useSelector((state) => state.cart?.totalItem || 0);
  const wishlistCount = useSelector((state) => (state.wishlist?.items || []).length);

  const onLogoClick = (e) => {
    e.preventDefault();
    navigate('/home');
  };

  return (
    <TopNavbar>
      <Container>
        <div onClick={onLogoClick} style={{ cursor: 'pointer' }}>
          <Link className="navbar-brand py-0" to="/">
            <LogoBox width={130} />
          </Link>
        </div>
        <TopbarMenuToggler />
        <SimpleAppMenu mobileMenuOpen={appMenuControl.open} menuClassName="mx-auto" topMenuItems={STUDENT_APP_MENU_ITEMS} />
        <ul className="nav flex-row align-items-center list-unstyled ms-xl-auto">
          <NotificationDropdown />
          <li className="nav-item ms-3 position-relative" style={{ cursor: 'pointer' }}>
            <Link to="/student/wishlist" className="btn btn-light btn-round mb-0 arrow-none">
              <CiHeart className="bi bi-cart3 fa-fw fs-5" />
            </Link>
            {wishlistCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger mt-xl-2 ms-n1"
                style={{ zIndex: 10, pointerEvents: 'none' }}
              >
                {wishlistCount}
              </span>
            )}
          </li>
          <li className="nav-item ms-3 position-relative" style={{ cursor: 'pointer' }}>
            <Link to="/student/cart" className="btn btn-light btn-round mb-0 arrow-none">
              <BsCart3 className="bi bi-cart3 fa-fw" />
            </Link>
            {cartCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-primary mt-xl-2 ms-n1"
                style={{ zIndex: 10, pointerEvents: 'none' }}
              >
                {cartCount}
              </span>
            )}
          </li>
          <ProfileDropdown className="nav-item ms-3" dropdownItems={STUDENT_ACCOUNT_DROPDOWN_ITEMS} />
        </ul>
      </Container>
    </TopNavbar>
  );
};

export default TopNavigationBar;
