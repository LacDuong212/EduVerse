import LogoBox from '@/components/LogoBox';
import TopNavbar from '@/components/TopNavbar';
import AppMenu from '@/components/TopNavbar/components/AppMenu';
import ProfileDropdown from '@/components/TopNavbar/components/ProfileDropdown';
import TopbarMenuToggler from '@/components/TopNavbar/components/TopbarMenuToggler';
import { useLayoutContext } from '@/context/useLayoutContext';
import { Container } from 'react-bootstrap';
const TopNavigationBar = () => {
  const {
    appMenuControl
  } = useLayoutContext();
  return <TopNavbar>
      <Container>
        <LogoBox height={36} width={143} />
        <TopbarMenuToggler />
        <AppMenu mobileMenuOpen={appMenuControl.open} menuClassName="mx-auto" showExtraPages searchInput />
        <ProfileDropdown className="ms-1 ms-lg-0" />
      </Container>
    </TopNavbar>;
};
export default TopNavigationBar;
