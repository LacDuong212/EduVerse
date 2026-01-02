
import { GUEST_APP_MENU_ITEMS } from '@/assets/data/menu-items.js';
import LogoBox from '@/components/LogoBox';
import TopNavbar from '@/components/TopNavBar';
import SimpleAppMenu from '@/components/TopNavBar/components/SimpleAppMenu';
import TopbarMenuToggler from '@/components/TopNavBar/components/TopbarMenuToggler';
import { useLayoutContext } from '@/context/useLayoutContext';
import { Container, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const TopNavigationBar = () => {
  const { appMenuControl } = useLayoutContext();
  const navigate = useNavigate();

  return (
    <TopNavbar>
      <Container >
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
          topMenuItems={GUEST_APP_MENU_ITEMS}
        />

        <div className="d-flex align-items-center ms-xl-auto gap-2">
          <Button
            variant="outline-primary"
            className="d-flex align-items-center mb-0"
            onClick={() => navigate('/auth/sign-in')}
          >
            Sign-in
          </Button>
          <Button
            variant="primary"
            className="d-flex align-items-center mb-0"
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
