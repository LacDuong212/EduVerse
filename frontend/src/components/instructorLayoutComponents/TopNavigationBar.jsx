import { INSTRUCTOR_APP_MENU_ITEMS, INSTRUCTOR_ACCOUNT_DROPDOWN_ITEMS } from '@/assets/data/menu-items.js';
import LogoBox from '../LogoBox';
import TopNavbar from '../TopNavBar';
import NotificationDropdown from '../TopNavBar/components/NotificationDropdown'
import ProfileDropdown from '../TopNavBar/components/ProfileDropdown';
import SimpleAppMenu from '../TopNavBar/components/SimpleAppMenu';
import TopbarMenuToggler from '../TopNavBar/components/TopbarMenuToggler';
import { useLayoutContext } from '@/context/useLayoutContext';
import { Container, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';


const TopNavigationBar = () => {
  const { appMenuControl } = useLayoutContext();

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
        <SimpleAppMenu
          mobileMenuOpen={appMenuControl.open}
          menuClassName="mx-auto"
          topMenuItems={INSTRUCTOR_APP_MENU_ITEMS}
        />

        <ul className="nav flex-row align-items-center justify-content-end gap-2 gap-md-3 list-unstyled">
          <NotificationDropdown />
          <ProfileDropdown className="nav-item" dropdownItems={INSTRUCTOR_ACCOUNT_DROPDOWN_ITEMS} />
        </ul>
      </Container>
    </TopNavbar>
  );
};

export default TopNavigationBar;
