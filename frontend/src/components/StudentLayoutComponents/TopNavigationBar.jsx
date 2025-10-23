import LogoBox from '@/components/LogoBox';
import TopNavbar from '@/components/TopNavbar';
import SimpleAppMenu from '@/components/TopNavbar/components/SimpleAppMenu';
import ProfileDropdown from '@/components/TopNavbar/components/ProfileDropdown';
import NotificationDropdown from '@/components/TopNavbar/components/NotificationDropdown'
import ShoppingCartDropdown from '@/components/TopNavbar/components/ShoppingCartDropdown';
// import TopbarMenuToggler from '@/components/TopNavbar/components/TopbarMenuToggler';
// import { useLayoutContext } from '@/context/useLayoutContext';
import { Container } from 'react-bootstrap';

const TopNavigationBar = () => {
  // const { appMenuControl } = useLayoutContext();

  return (
    <TopNavbar>
      <Container>
        <LogoBox height={36} width={143} />
        {/* <TopbarMenuToggler /> */}
        {/* <SimpleAppMenu mobileMenuOpen={appMenuControl.open} menuClassName="mx-auto" /> */}
        <SimpleAppMenu mobileMenuOpen={false} menuClassName="mx-auto" />
        <ul className="nav flex-row align-items-center list-unstyled ms-xl-auto">
          <NotificationDropdown />
          <ShoppingCartDropdown />
          <ProfileDropdown className="nav-item ms-3" />
        </ul>
      </Container>
    </TopNavbar>
  );
};

export default TopNavigationBar;
