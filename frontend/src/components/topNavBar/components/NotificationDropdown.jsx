import { Card, CardBody, CardFooter, CardHeader, Dropdown, DropdownMenu, DropdownToggle } from 'react-bootstrap';
import { BsBell } from 'react-icons/bs';
import { Link } from 'react-router-dom';


const NotificationDropdown = () => {
  return (
    <Dropdown className="nav-item">
      <DropdownToggle className="btn btn-light btn-round arrow-none mb-0" as="a" role="button" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">
        <BsBell className="fa-fw" />
      </DropdownToggle>
      <span className="notif-badge animation-blink" />
      <DropdownMenu className="dropdown-animation dropdown-menu-end dropdown-menu-size-md p-0 shadow-lg border-0">
        <Card className="bg-transparent">
          <CardHeader className="bg-transparent border-bottom py-4 d-flex justify-content-between align-items-center">
            <h6 className="m-0">
              Notifications <span className="badge bg-danger bg-opacity-10 text-danger ms-2">1 new</span>
            </h6>
            <a className="small" href="#">
              Clear all
            </a>
          </CardHeader>
          <CardBody className="p-0">
            <ul className="list-group list-unstyled list-group-flush">
              <li>
                <a href="#" className="list-group-item-action border-0 border-bottom d-flex p-3">
                  <div className="me-3">
                    <div className="avatar avatar-md">
                      <img className="avatar-img rounded-circle" src="/logo_icon.svg" alt="avatar" />
                    </div>
                  </div>
                  <div>
                    <h6 className="mb-1">Welcome to EduVerse</h6>
                    <p className="small text-body m-0">Need help? Watch our quick tutorial to get started!</p>
                    <small className="text-body">3 min ago</small>
                  </div>
                </a>
              </li>
            </ul>
          </CardBody>
          <CardFooter className="bg-transparent border-0 py-3 text-center position-relative">
            <Link to="" className="stretched-link">
              See all incoming activity
            </Link>
          </CardFooter>
        </Card>
      </DropdownMenu>
    </Dropdown>
  );
};

export default NotificationDropdown;
