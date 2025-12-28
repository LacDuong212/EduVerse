import { STUDENT_APP_MENU_ITEMS, STUDENT_ACCOUNT_DROPDOWN_ITEMS } from '@/assets/data/menu-items.js';
import LogoBox from '@/components/LogoBox';
import TopNavbar from '@/components/TopNavBar';
import NotificationDropdown from '@/components/TopNavBar/components/NotificationDropdown'
import ProfileDropdown from '@/components/TopNavBar/components/ProfileDropdown';
import SimpleAppMenu from '@/components/TopNavBar/components/SimpleAppMenu';
import TopbarMenuToggler from '@/components/TopNavBar/components/TopbarMenuToggler';
import { useLayoutContext } from '@/context/useLayoutContext';

import { Container, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Link } from "react-router";
import { CiHeart } from "react-icons/ci";
import { BsCart3 } from 'react-icons/bs';

const TopNavigationBar = () => {
  const { appMenuControl } = useLayoutContext();

  const cartCount = useSelector((state) => state.cart?.totalItem || 0);
  const wishlistCount = useSelector((state) => (state.wishlist?.items || []).length);

  return (
    <TopNavbar>
      <Container>
        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip>Home</Tooltip>}
        >
          <span className="d-inline-block">
            <Link className="navbar-brand py-0" to="/home">
              <LogoBox width={130} />
            </Link>
          </span>
        </OverlayTrigger>

        <TopbarMenuToggler />
        <SimpleAppMenu mobileMenuOpen={appMenuControl.open} menuClassName="mx-auto" topMenuItems={STUDENT_APP_MENU_ITEMS} />

        <ul className="nav flex-row align-items-center justify-content-end gap-2 gap-md-3 list-unstyled">
          
          <NotificationDropdown />

          <li className="nav-item position-relative" style={{ cursor: 'pointer' }}>
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip>Wishlist</Tooltip>}
            >
              <Link to="/student/wishlist" className="btn btn-light btn-round mb-0 arrow-none">
                <CiHeart className="bi bi-cart3 fa-fw fs-5" />
              </Link>
            </OverlayTrigger>
            {wishlistCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger mt-xl-2 ms-n1"
                style={{ zIndex: 10, pointerEvents: 'none' }}
              >
                {wishlistCount}
              </span>
            )}
          </li>
          
          <li className="nav-item position-relative" style={{ cursor: 'pointer' }}>
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip>Cart</Tooltip>}
            >
              <Link to="/student/cart" className="btn btn-light btn-round mb-0 arrow-none">
                <BsCart3 className="bi bi-cart3 fa-fw" />
              </Link>
            </OverlayTrigger>
            {cartCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-primary mt-xl-2 ms-n1"
                style={{ zIndex: 10, pointerEvents: 'none' }}
              >
                {cartCount}
              </span>
            )}
          </li>

          <ProfileDropdown className="nav-item" dropdownItems={STUDENT_ACCOUNT_DROPDOWN_ITEMS} />
        </ul>
      </Container>
    </TopNavbar>
  );
};

export default TopNavigationBar;
