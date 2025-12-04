import instructor7 from '@/assets/images/instructor/07.jpg';
import { Card, CardBody } from 'react-bootstrap';
import { FaFacebookF, FaInstagram, FaRegStar, FaStar, FaStarHalfAlt, FaTwitter } from 'react-icons/fa';
import { FaLinkedinIn } from 'react-icons/fa6';

const InstructorAvatarCard = ({  }) => {
  return (
    <Card className="shadow shadow-sm p-2 mb-4 text-center">
      <div className="rounded-3">
        <img src={instructor7} className="card-img" alt="course image" />
      </div>
      <CardBody className="px-3">
        <ul className="list-inline icons-center">
          {Array(Math.floor(4.5)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small">
            <FaStar size={14} className="text-warning" />
          </li>)}
          {!Number.isInteger(4.5) && <li className="list-inline-item me-1 small">

            <FaStarHalfAlt size={14} className="text-warning" />
          </li>}
          {4.5 < 5 && Array(5 - Math.ceil(4.5)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small">
            <FaRegStar size={14} className="text-warning" />
          </li>)}
          <li className="list-inline-item ms-2 h6 fw-light mb-0">4.5/5.0</li>
        </ul>
        <ul className="list-inline mb-0">
          <li className="list-inline-item">

            <a className="btn px-2 btn-sm bg-facebook" href="#">
              <FaFacebookF className="h-13px" />
            </a>
          </li>
          <li className="list-inline-item">

            <a className="btn px-2 btn-sm bg-instagram-gradient" href="#">
              <FaInstagram />
            </a>
          </li>
          <li className="list-inline-item">

            <a className="btn px-2 btn-sm bg-twitter" href="#">
              <FaTwitter />
            </a>
          </li>
          <li className="list-inline-item">

            <a className="btn px-2 btn-sm bg-linkedin" href="#">
              <FaLinkedinIn className="fab fa-fw fa-linkedin-in" />
            </a>
          </li>
        </ul>
      </CardBody>
    </Card>
  );
};

export default InstructorAvatarCard;