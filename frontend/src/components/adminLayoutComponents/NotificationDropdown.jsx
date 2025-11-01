import { notificationData } from '@/assets/data/other';
import { Card, CardBody, CardFooter, CardHeader, Dropdown, DropdownMenu, DropdownToggle } from 'react-bootstrap';
import { BsBell } from 'react-icons/bs';
const NotificationCard = ({
  title,
  description,
  image,
  isDetails,
  isTime
}) => {
  return <li>
      <a href="#" className="list-group-item-action border-0 border-bottom d-flex p-3">
        <div className="me-3">
          <div className="avatar avatar-md">
            <img className="avatar-img rounded-circle" src={image} alt="avatar" />
          </div>
        </div>
        <div>
          <h6 className="mb-1">{title}</h6>
          <p className="small text-body m-0">{description}</p>
          {isDetails && <u className="small">View detail</u>}
          {isTime && <small className="text-body">5 min ago</small>}
        </div>
      </a>
    </li>;
};
const NotificationDropdown = () => {
  return <Dropdown drop={'start'} className="nav-item ms-2 ms-md-3 ">
      <DropdownToggle className="btn btn-light btn-round mb-0 arrow-none" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">
        <BsBell />
      </DropdownToggle>
      <span className="notif-badge animation-blink" />
      <DropdownMenu className="dropdown-animation dropdown-menu-start dropdown-menu-size-md p-0 shadow-lg border-0">
        <Card className="bg-transparent">
          <CardHeader className="bg-transparent border-bottom py-4 d-flex justify-content-between align-items-center">
            <h6 className="m-0">
              Notifications <span className="badge bg-danger bg-opacity-10 text-danger ms-2">2 new</span>
            </h6>
            <a className="small" href="#">
              Clear all
            </a>
          </CardHeader>
          <CardBody className="p-0">
            <ul className="list-group list-unstyled list-group-flush">
              {notificationData.map((item, idx) => <NotificationCard key={idx} {...item} />)}
            </ul>
          </CardBody>
          <CardFooter className="bg-transparent border-0 py-3 text-center position-relative">
            <a href="#" className="stretched-link">
              See all incoming activity
            </a>
          </CardFooter>
        </Card>
      </DropdownMenu>
    </Dropdown>;
};
export default NotificationDropdown;
