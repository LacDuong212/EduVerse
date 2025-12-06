import { INSTRUCTOR_APP_MENU_ITEMS, INSTRUCTOR_ACCOUNT_DROPDOWN_ITEMS } from '@/assets/data/menu-items.js';
import LogoBox from '../LogoBox';
import TopNavbar from '../TopNavbar';
import NotificationDropdown from '../TopNavbar/components/NotificationDropdown'
import ProfileDropdown from '../TopNavbar/components/ProfileDropdown';
import SimpleAppMenu from '../TopNavbar/components/SimpleAppMenu';
import TopbarMenuToggler from '../TopNavbar/components/TopbarMenuToggler';
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
            <Link className="navbar-brand py-0" to="/">
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

        <ul className="nav flex-row align-items-center list-unstyled ms-xl-auto">
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip>Notifications</Tooltip>}
          >
            <span className="d-inline-block">
              <NotificationDropdown />
            </span>
          </OverlayTrigger>
          <ProfileDropdown className="nav-item ms-3" dropdownItems={INSTRUCTOR_ACCOUNT_DROPDOWN_ITEMS} />
        </ul>
      </Container>
    </TopNavbar>
  );
};

export default TopNavigationBar;
