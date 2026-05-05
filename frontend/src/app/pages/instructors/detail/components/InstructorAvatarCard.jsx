import { Card, CardBody } from "react-bootstrap";
import { FaFacebookF, FaInstagram, FaRegStar, FaStar, FaStarHalfAlt, FaTwitter, FaYoutube } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa6";
import { DEFAULT_AVATAR_IMG } from "@/contexts/constants";

const InstructorAvatarCard = ({ data }) => {
  const {
    name = "",
    occupation = "",
    avatar = DEFAULT_AVATAR_IMG,
    averageRating = 0.0,
    socials = {}
  } = data || {};

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
    <Card className="shadow p-4 text-center">
      <div
        className="rounded-3 border border-3 overflow-hidden mb-3 mx-auto w-100"
        style={{ aspectRatio: "1 / 1" }}
      >
        <img
          src={avatar || DEFAULT_AVATAR_IMG}
          alt="Instructor Avatar"
          className="w-100 h-100"
          style={{ objectFit: "cover" }}
          onError={(e) => e.target.src = DEFAULT_AVATAR_IMG}
        />
      </div>

      <CardBody className="mt-2 p-0 d-flex flex-column gap-2">
        <div>
          <span className="h3 mb-0">{name || "Unknown Instructor"}</span>
          <p className="h6 fw-light mb-0">{occupation || "Classic Instructor"}</p>
        </div>

        <div>
          <ul className="list-inline icons-center mb-0">
            {Array(fullStars).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 mb-1 small">
              <FaStar size={14} className="text-warning" />
            </li>)}
            {halfStar && <li className="list-inline-item me-1 small">

              <FaStarHalfAlt size={14} className="text-warning" />
            </li>}
            {safeRating < 5 && Array(5 - Math.ceil(safeRating)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 mb-1 small">
              <FaRegStar size={14} className="text-warning" />
            </li>)}
          </ul>

          <div className="h6 fw-light mb-0">{safeRating.toFixed(1)}/5.0</div>
        </div>

        <ul className="list-inline mb-0">
          {socials.facebook && <li className="list-inline-item">
            <a className="btn btn-sm mt-1 mb-0 px-2 bg-facebook" href={normalizeUrl(socials.facebook)} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebookF className="h-13px" />
            </a>
          </li>}
          {socials.instagram && <li className="list-inline-item">
            <a className="btn btn-sm mt-1 mb-0 px-2 bg-instagram-gradient" href={normalizeUrl(socials.instagram)} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
          </li>}
          {socials.linkedin && <li className="list-inline-item">
            <a className="btn btn-sm mt-1 mb-0 px-2 bg-linkedin" href={normalizeUrl(socials.linkedin)} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedinIn className="fab fa-fw fa-linkedin-in" />
            </a>
          </li>}
          {socials.twitter && <li className="list-inline-item">
            <a className="btn btn-sm mt-1 mb-0 px-2 bg-twitter" href={normalizeUrl(socials.twitter)} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter />
            </a>
          </li>}
          {socials.youtube && <li className="list-inline-item">
            <a className="btn btn-sm mt-1 mb-0 px-2 bg-youtube" href={normalizeUrl(socials.youtube)} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <FaYoutube />
            </a>
          </li>}
        </ul>
      </CardBody>
    </Card>
  );
};

export default InstructorAvatarCard;