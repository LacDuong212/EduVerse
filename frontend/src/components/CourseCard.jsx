import { Card, CardBody, CardFooter, CardTitle } from 'react-bootstrap';
import { FaRegClock, FaRegHeart, FaRegStar, FaHeart, FaStar, FaStarHalfAlt, FaTable } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import useToggle from '@/hooks/useToggle';
import { formatCurrency } from '@/context/constants';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n ?? 0));

const CourseCard = ({ course }) => {
  const { isTrue: isOpen, toggle } = useToggle();
  const navigate = useNavigate();

  // --------- Safe mapping & fallbacks ----------
  const image =
    course.image ||
    course.thumbnail ||
    'https://via.placeholder.com/640x360?text=Course';

  const title = course.title || course.name || 'Untitled';
  const description = course.description || course.subtitle || '';

  // rating: chấp nhận {average} hoặc {star} hoặc số thô
  const rawStar =
    typeof course?.rating === 'object'
      ? (course?.rating?.average ?? course?.rating?.star)
      : course?.rating;

  const starNum = Number(rawStar);
  const star = Number.isFinite(starNum) ? clamp(starNum, 0, 5) : 0;

  const fullStars = Math.floor(star);
  const hasHalf = Number.isFinite(star) && !Number.isInteger(star);
  const emptyStars = Math.max(0, 5 - Math.ceil(star));
  const subtitle = course.subtitle || course._raw?.subtitle || '';
  const price = Number(course.price ?? course._raw?.price ?? 0);
  const discountPrice = course.discountPrice != null
    ? Number(course.discountPrice)
    : (course._raw?.discountPrice != null ? Number(course._raw.discountPrice) : null);
  const hasDiscount = Number.isFinite(discountPrice) && discountPrice < price;
  const isFree = (discountPrice ?? price) === 0;

  const discountPercent = hasDiscount
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;
  // duration: ưu tiên số -> render " hours"; nếu là chuỗi thì in nguyên
  const rawDuration =
    course.duration ?? course.totalDuration ?? course.totalHours ?? null;
  const durationText =
    typeof rawDuration === 'number'
      ? `${rawDuration} hours`
      : (typeof rawDuration === 'string' ? rawDuration : '—');

  // lectures: hỗ trợ nhiều tên trường
  const lectures =
    course.lectures ?? course.lecturesCount ?? course.lectureCount ?? 0;

  // badge fallback
  const badge =
    course.badge || {
      class: 'bg-primary',
      text: course.level || course.category || 'Course',
    };

  // điều hướng
  const id = course.id || course._id || course.courseId;
  const handleClick = () => {
    if (id) navigate(`/courses/${id}`);
  };
  const priceNode = (() => {
    if (isFree) {
      return <h5 className="text-success mb-0">Free</h5>;
    }

    if (hasDiscount) {
      return (
       <div className="d-flex flex-column align-items-end text-end ms-auto">
  <div className="small text-muted text-decoration-line-through">
    {formatCurrency(price)}
  </div>
  <div className="d-flex align-items-center justify-content-end gap-2">
    <small className="badge bg-danger-subtle text-danger me-1">
      -{discountPercent}%
    </small>
    <h5 className="text-success mb-0">
      {formatCurrency(discountPrice)}
    </h5>
  </div>
</div>
      );
    }

    return (
      <h5 className="text-success mb-0">
        {formatCurrency(price)}
      </h5>
    );
  })();
  console.log('course data:', course);

  // --------------------------------------------
  return (
    <Card className="shadow h-100 position-relative">
      {isFree ? (
        <div className="ribbon"><span>Free</span></div>
      ) : hasDiscount ? (
        <div className="ribbon"><span>-{discountPercent}%</span></div>
      ) : null}

      <img src={image} className="card-img-top" alt="course image" />

      {/* ✅ đổi CardBody thành flex column để đẩy giá xuống đáy */}
      <CardBody className="d-flex flex-column pb-0">
        {/* phần nội dung phía trên chiếm chỗ */}
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between mb-2">
            <span className={`badge ${badge.class} bg-opacity-60`}>{badge.text}</span>
            <span role="button" className="h6 mb-0" onClick={toggle}>
              {isOpen ? <FaHeart fill="red" /> : <FaRegHeart />}
            </span>
          </div>

          <CardTitle onClick={handleClick} style={{ cursor: id ? 'pointer' : 'default' }}>
            {title}
          </CardTitle>

          {subtitle && <p className="mb-2 text-truncate-2">{subtitle}</p>}

          <ul className="list-inline mb-0">
            {Array.from({ length: fullStars }).map((_, idx) => (
              <li key={`f-${idx}`} className="list-inline-item me-1 small">
                <FaStar size={14} className="text-warning" />
              </li>
            ))}
            {hasHalf && (
              <li className="list-inline-item me-1 small">
                <FaStarHalfAlt size={14} className="text-warning" />
              </li>
            )}
            {Array.from({ length: emptyStars }).map((_, idx) => (
              <li key={`e-${idx}`} className="list-inline-item me-1 small">
                <FaRegStar size={14} className="text-warning" />
              </li>
            ))}
            <li className="list-inline-item ms-2 h6 fw-light mb-0">
              {Number.isFinite(star) ? star.toFixed(1) : '—'}
            </li>
          </ul>
        </div>

        {/* ✅ khối giá luôn sát đáy CardBody, ngay trên hr */}
        <div className="mt-auto d-flex justify-content-end align-items-end">
          {priceNode}
        </div>
      </CardBody>

      <CardFooter className="pt-0 pb-3">
        <hr />
        <div className="d-flex justify-content-between">
          <span className="h6 fw-light mb-0">
            <FaRegClock className="text-danger me-2" />
            {durationText}
          </span>
          <span className="h6 fw-light mb-0">
            <FaTable className="text-orange me-2" />
            {lectures} lectures
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};


export default CourseCard;
