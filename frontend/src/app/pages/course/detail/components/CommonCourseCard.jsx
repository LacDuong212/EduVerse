import { Card, CardBody, CardFooter, CardTitle } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  FaStar,
  FaRegClock,
  FaTable,
} from 'react-icons/fa';
import { formatCurrency } from '@/utils/currency';
import { secondsToHours } from '@/utils/duration';

const DEFAULT_COURSE_IMG = "https://res.cloudinary.com/dw1fjzfom/image/upload/v1764427835/course_default_image_pwqnyo.jpg";

const CommonCourseCard = ({ course }) => {
  const {
    id,
    name,
    duration,
    avatar,
    thumbnail,
    badge,
    rating,
    title,
    price,
    discountPrice,
    discountPercent,
    students,
    lectures,
    category,
  } = course;

  const isFree = (discountPrice ?? price) === 0;
  const hasDiscount = Number.isFinite(discountPrice) && discountPrice < price;
  const detailPath = id ? `/courses/${id}` : '#';

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_COURSE_IMG;
  };

  return (
    <Card className="action-trigger-hover border bg-transparent position-relative h-100 d-flex flex-column">
      {/* Ribbon */}
      {isFree ? (
        <div className="ribbon"><span>Free</span></div>
      ) : hasDiscount ? (
        <div className="ribbon"><span>{`-${discountPercent}%`}</span></div>
      ) : null}

      {/* Thumbnail */}
      <Link to={detailPath}>
        <img
          src={thumbnail || DEFAULT_COURSE_IMG}
          className="card-img-top"
          alt={title}
          onError={handleImageError}
          style={{
            cursor: id ? 'pointer' : 'default',
            height: '240px',
            width: '100%',
            objectFit: 'cover'
          }}
        />
      </Link>

      <CardBody className="pb-0 d-flex flex-column flex-grow-1">
        <div className="d-flex justify-content-between mb-3">
          <span className="hstack gap-2">
            <span className="badge bg-primary bg-opacity-10 text-primary">
              {category}
            </span>
            <span className="badge text-bg-dark">{badge.text}</span>
          </span>
        </div>

        <CardTitle className="mb-2">
          <Link
            to={detailPath}
            className="text-decoration-none text-truncate-2"
            style={{ 
                cursor: id ? 'pointer' : 'default', 
                display: '-webkit-box', 
                WebkitLineClamp: 2, 
                WebkitBoxOrient: 'vertical', 
                overflow: 'hidden',
                minHeight: '50px' 
            }}
            title={title}
          >
            {title}
          </Link>
        </CardTitle>

        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="hstack gap-2">
            <p className="text-warning m-0">
              {rating.star} <FaStar className="text-warning ms-1" />
            </p>
            <span className="small">({rating.review})</span>
          </div>
          <div className="hstack gap-2">
            <p className="h6 fw-light mb-0 m-0">{students}</p>
            <span className="small">students</span>
          </div>
        </div>

        <div className="hstack gap-3 mt-auto">
          <span className="h6 fw-light mb-0">
            <FaRegClock className="text-danger me-2" />
            {secondsToHours(duration).toLocaleString('vi-VN')}h
          </span>
          <span className="h6 fw-light mb-0">
            <FaTable className="text-orange me-2" />
            {lectures} {lectures === 1 ? 'lecture' : 'lectures'}
          </span>
        </div>
      </CardBody>

      <CardFooter className="pt-0 bg-transparent">
        <hr />
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div className="avatar avatar-sm">
              <img className="avatar-img rounded-1" src={avatar} alt="avatar" />
            </div>
            <p className="mb-0 ms-2">
              <span className="h6 fw-light mb-0 text-truncate" style={{ maxWidth: '100px', display: 'inline-block' }}>{name}</span>
            </p>
          </div>

          <div className="text-end">
            {isFree ? (
              <div className="d-flex flex-column align-items-end">
                 <div className="small text-muted text-decoration-line-through" style={{ visibility: 'hidden' }}>&nbsp;</div>
                 <h4 className="text-success mb-0">Free</h4>
              </div>
            ) : hasDiscount ? (
              <div className="d-flex flex-column align-items-end">
                <div className="small text-muted text-decoration-line-through">
                  {formatCurrency(price)}
                </div>
                <h4 className="text-success mb-0">
                  {formatCurrency(discountPrice)}
                </h4>
              </div>
            ) : (
              <div className="d-flex flex-column align-items-end">
                 <div className="small text-muted text-decoration-line-through" style={{ visibility: 'hidden' }}>
                    {formatCurrency(price)}
                 </div>
                 <h4 className="text-success mb-0">{formatCurrency(price)}</h4>
              </div>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CommonCourseCard;