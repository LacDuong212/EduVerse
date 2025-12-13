import instructor7 from '@/assets/images/instructor/07.jpg';
import { Card, CardBody } from 'react-bootstrap';
import { FaFacebookF, FaInstagram, FaRegStar, FaStar, FaStarHalfAlt, FaTwitter, FaYoutube } from 'react-icons/fa';
import { FaLinkedinIn } from 'react-icons/fa6';

const InstructorAvatarCard = ({ avatar = "", averageRating = 0.0, socials = {} }) => {

  function normalizeUrl(value) {
    if (!value) return null;

    // already absolute
    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    return `https://${value}`;
  }

  const safeRating = Number.isFinite(averageRating) ? Math.max(0, Math.min(5, averageRating)) : 0;
  const fullStars = Math.floor(safeRating);
  const halfStar = !Number.isInteger(safeRating) && safeRating - fullStars >= 0.5;

  return (
    <Card className="shadow p-4 mb-4 text-center">
      <div className="rounded-3 border border-3">
        <img
          src={avatar || "https://res.cloudinary.com/dw1fjzfom/image/upload/v1757337425/av4_khpvlh.png"}
          alt="Instructor Avatar"
          className="rounded-2"
        />
      </div>
      <CardBody className="mt-2 p-0">
        <ul className="list-inline icons-center">
          {Array(fullStars).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 mb-1 small">
            <FaStar size={14} className="text-warning" />
          </li>)}
          {halfStar && <li className="list-inline-item me-1 mb-1 small">

            <FaStarHalfAlt size={14} className="text-warning" />
          </li>}
          {safeRating < 5 && Array(5 - Math.ceil(safeRating)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 mb-1 small">
            <FaRegStar size={14} className="text-warning" />
          </li>)}
          <li className="list-inline-item ms-2 h6 fw-light mb-0">{safeRating.toFixed(1)}/5.0</li>
        </ul>

        <ul className="list-inline mb-0">
          {socials.facebook && <li className="list-inline-item">
            <a className="btn px-2 btn-sm bg-facebook" href={normalizeUrl(socials.facebook)} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebookF className="h-13px" />
            </a>
          </li>}
          {socials.instagram && <li className="list-inline-item">
            <a className="btn px-2 btn-sm bg-instagram-gradient" href={normalizeUrl(socials.instagram)} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
          </li>}
          {socials.twitter && <li className="list-inline-item">
            <a className="btn px-2 btn-sm bg-twitter" href={normalizeUrl(socials.twitter)} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter />
            </a>
          </li>}
          {socials.youtube && <li className="list-inline-item">
            <a className="btn px-2 btn-sm bg-youtube" href={normalizeUrl(socials.youtube)} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <FaYoutube />
            </a>
          </li>}
          {socials.linkedin && <li className="list-inline-item">
            <a className="btn px-2 btn-sm bg-linkedin" href={normalizeUrl(socials.linkedin)} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedinIn className="fab fa-fw fa-linkedin-in" />
            </a>
          </li>}
        </ul>
      </CardBody>
    </Card>
  );
};

export default InstructorAvatarCard;