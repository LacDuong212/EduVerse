import { Card, CardBody, CardFooter, CardTitle } from 'react-bootstrap';
import { FaRegClock, FaRegHeart, FaRegStar, FaHeart, FaStar, FaStarHalfAlt, FaTable } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { formatCurrency } from '@/utils/currency';
import { secondsToHours } from '@/utils/duration';

import { toast } from 'react-toastify';

import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '@/redux/wishlistSlice';

const DEFAULT_COURSE_IMG = "https://res.cloudinary.com/dw1fjzfom/image/upload/v1764427835/course_default_image_pwqnyo.jpg";

const clamp = (n, min, max) => Math.max(min, Math.min(max, n ?? 0));

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userData } = useSelector((state) => state.auth);

  const isStudent = userData?.role?.toLowerCase() === "student";

  const wishlistItems = useSelector((state) => state.wishlist.items || []);

  if (!course) return null;

  const currentCourseId = course._id || course.courseId || course.id;

  const isWishlisted = wishlistItems.some((item) => {
    const itemCourseId = item.courseId?._id || item.courseId;

    return itemCourseId?.toString() === currentCourseId?.toString();
  });

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_COURSE_IMG;
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userData?._id) {
      toast.info("Please login to add to wishlist!");
      return;
    }

    if (!currentCourseId) {
      toast.error("Error: Course ID missing");
      return;
    }

    try {
      if (isWishlisted) {
        await dispatch(removeFromWishlist({
          userId: userData._id,
          courseId: currentCourseId
        })).unwrap();

        toast.success("Removed from wishlist");
      } else {
        const coursePayload = { ...course, _id: currentCourseId };

        await dispatch(addToWishlist({
          userId: userData._id,
          course: coursePayload
        })).unwrap();

        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("Wishlist action failed:", error);
      toast.error(typeof error === 'string' ? error : "Something went wrong!");
    }
  };

  const image =
    course.image ||
    course.thumbnail ||
    DEFAULT_COURSE_IMG;

  const title = course.title || course.name || 'Untitled';

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
  const rawDuration =
    course.duration ?? course.totalDuration ?? course.totalHours ?? null;
  const hoursValue = secondsToHours(rawDuration);
  const durationText = hoursValue > 0 
  ? `${hoursValue.toString().replace('.', ',')} hours` 
  : '—';

  const lectures =
    course.lectures ?? course.lecturesCount ?? course.lectureCount ?? 0;

  const badge =
    course.badge || {
      class: 'bg-primary',
      text: course.level || course.category?.name || 'Course',
    };

  return (
    <Card className="shadow h-100 position-relative">
      {isFree ? (
        <div className="ribbon"><span>Free</span></div>
      ) : hasDiscount ? (
        <div className="ribbon"><span>-{discountPercent}%</span></div>
      ) : null}

      <img
        src={image}
        className="card-img-top"
        alt={title}
        onError={handleImageError}
        onClick={() => navigate(`/courses/${currentCourseId}`)}
        style={{
          objectFit: 'cover',
          height: '240px',
          width: '100%',
          cursor: 'pointer'
        }}
      />

      <CardBody className="d-flex flex-column pb-0">
        <div className="flex-grow-1">
          {isStudent && <div className="d-flex justify-content-between mb-2">
            <span className={`badge ${badge.class} bg-opacity-60`}>{badge.text}</span>
            <span role="button" className="h6 mb-0" onClick={handleWishlistToggle}>
              {isWishlisted ? <FaHeart fill="red" /> : <FaRegHeart />}
            </span>
          </div>}

          <CardTitle>
            <Link
              to={`/courses/${currentCourseId}`}
              className="text-decoration-none"
            >
              {title}
            </Link>
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

        <div className="mt-auto d-flex justify-content-end align-items-end">
          {isFree ? <h5 className="text-success mb-0">Free</h5> :
            hasDiscount ? (
              <div className="text-end">
                <small className="text-secondary text-decoration-line-through">{formatCurrency(price)}</small>
                <h5 className="text-success mb-0">{formatCurrency(discountPrice)}</h5>
              </div>
            ) : <h5 className="text-success mb-0">{formatCurrency(price)}</h5>
          }
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
