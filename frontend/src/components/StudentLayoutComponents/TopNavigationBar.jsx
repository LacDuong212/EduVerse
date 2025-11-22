import { STUDENT_APP_MENU_ITEMS, STUDENT_ACCOUNT_DROPDOWN_ITEMS } from '@/assets/data/menu-items.js';
import LogoBox from '@/components/LogoBox';
import TopNavbar from '@/components/TopNavbar';
import NotificationDropdown from '@/components/TopNavbar/components/NotificationDropdown'
import ProfileDropdown from '@/components/TopNavbar/components/ProfileDropdown';
import SimpleAppMenu from '@/components/TopNavbar/components/SimpleAppMenu';
import TopbarMenuToggler from '@/components/TopNavbar/components/TopbarMenuToggler';
import ShoppingCartDropdown from '@/components/TopNavbar/components/ShoppingCartDropdown';
import { useLayoutContext } from '@/context/useLayoutContext';
import { fetchWishlist } from '@/redux/wishlistSlice';

import { Container } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router";
import { CiHeart } from "react-icons/ci";
import { useEffect } from 'react';

const TopNavigationBar = () => {
  const { appMenuControl } = useLayoutContext();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userData } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userData?._id) {
      dispatch(fetchWishlist(userData._id));
    }
  }, [dispatch, userData]);

  const cartCount = useSelector((state) => (state.cart?.items || []).length);
  const wishlistCount = useSelector((state) => (state.wishlist?.items || []).length);

  const onLogoClick = (e) => {
    e.preventDefault();
    navigate('/home');
  };
  const onCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/student/cart');
  };

  return (
    <TopNavbar>
      <Container>
        <div onClick={onLogoClick} style={{ cursor: 'pointer' }}>
          <LogoBox width={130} />
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
          <li
            className="nav-item ms-3 position-relative"
            onClickCapture={onCartClick}
            style={{ cursor: 'pointer' }}
          >
            <ShoppingCartDropdown />
            {cartCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-dark mt-xl-2 ms-n1"
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
