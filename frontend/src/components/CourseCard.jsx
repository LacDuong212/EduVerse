import { Card, CardBody, CardFooter, CardTitle } from "react-bootstrap";
import { FaBook, FaRegClock, FaRegHeart, FaRegStar, FaHeart, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { DEFAULT_COURSE_IMG } from "@/contexts/constants";
import { addToWishlist, removeFromWishlist } from "@/redux/wishlistSlice";
import { formatCurrency } from "@/utils/currency";
import { secondsToHours } from "@/utils/duration";

const clamp = (n, min, max) => Math.max(min, Math.min(max, n ?? 0));

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userData } = useSelector((state) => state.auth);

  const wishlistItems = useSelector((state) => state.wishlist.items || []);

  if (!course) return null;

  const currentCourseId = course.courseId;

  const isWishlisted = wishlistItems.some((item) => {
    return item.courseId === currentCourseId;
  });

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_COURSE_IMG;
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userData?.userId) {
      toast.info("Please login to add to wishlist!");
      return;
    }

    if (userData?.role === "instructor") {
      toast.warning("You cannot perform this action.");
      return;
    }

    if (!currentCourseId) {
      toast.error("Unable to get course info..");
      return;
    }

    try {
      if (isWishlisted) {
        await dispatch(removeFromWishlist({ courseId: currentCourseId })).unwrap();
        toast.success("Removed from wishlist!");
      } else {
        await dispatch(addToWishlist({ courseId: currentCourseId })).unwrap();
        toast.success("Added to wishlist!");
      }
    } catch (error) {
      console.error("Wishlist action failed:", error);
      toast.error(typeof error === "string" ? error : "Something went wrong..");
    }
  };

  const title = course.title || "Untitled";
  const subtitle = course.subtitle || null;
  const image = course.image || course.thumbnail || DEFAULT_COURSE_IMG;

  const averageRating = course.ratingTotal && course.ratingCount !== 0
    ? (course.ratingTotal / course.ratingCount).toFixed(1)
    : 0;
  const avgRatingNum = Number(averageRating);
  const star = Number.isFinite(avgRatingNum) ? clamp(avgRatingNum, 0, 5) : 0;

  const fullStars = Math.floor(star);
  const hasHalf = Number.isFinite(star) && !Number.isInteger(star);
  const emptyStars = Math.max(0, 5 - Math.ceil(star));

  const price = Number(course.price ?? null);
  const hasDiscount = course.enableDiscount ?? false;
  const discountPrice = Number(course.discountPrice ?? null);
  const isFree = course.isFree ?? false;

  const discountPercent = hasDiscount
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;
  const duration = course.duration ?? null;
  const hoursValue = secondsToHours(duration);
  const hoursText = hoursValue.toString().replace(".", ",");
  const durationText = hoursValue > 0
    ? `${hoursText} hour${hoursValue === 1 ? "" : "s"}`
    : "—";

  const lectures = course.lecturesCount ?? 0;

  const levelBadge = {
    class: "bg-info",
    text: course.level?.toUpperCase() || "",
  };

  const categoryBadge = {
    class: "bg-primary",
    text: course.category?.name?.toUpperCase() || "",
  };

  return (
    <Card className="shadow border h-100">
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
          objectFit: "cover",
          height: "240px",
          width: "100%",
          cursor: "pointer"
        }}
      />

      <CardBody className="d-flex flex-column pb-0 flex-grow-1">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="d-flex flex-wrap gap-1">
            <span className={`badge ${levelBadge.class} bg-opacity-60`}>{levelBadge.text}</span>
            <span className={`badge ${categoryBadge.class} bg-opacity-60`}>{categoryBadge.text}</span>
          </div>
          <span role="button" className="h6 mb-0" onClick={handleWishlistToggle}>
            {isWishlisted ? <FaHeart fill="red" /> : <FaRegHeart />}
          </span>
        </div>

        <CardTitle>
          <Link
            to={`/courses/${currentCourseId}`}
            className="text-decoration-none"
          >
            {title}
          </Link>
        </CardTitle>

        {subtitle && <p className="mb-2 text-truncate-2">{subtitle}</p>}

        <div className="mt-auto d-flex justify-content-between align-items-center">
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
          </ul>

          <div>
            {isFree ? <h5 className="text-success mb-0">Free</h5> :
              hasDiscount ? (
                <div className="text-end">
                  <small className="text-secondary text-decoration-line-through">{formatCurrency(price)}</small>
                  <h5 className="text-success mb-0">{formatCurrency(discountPrice)}</h5>
                </div>
              ) : <h5 className="text-success mb-0">{formatCurrency(price)}</h5>
            }
          </div>
        </div>
      </CardBody>

      <CardFooter className="pt-0 pb-3">
        <hr />
        <div className="d-flex justify-content-between">
          <span className="h6 fw-light mb-0">
            <FaRegClock className="text-danger me-2 mb-1" />
            {durationText}
          </span>
          <span className="h6 fw-light mb-0">
            <FaBook className="text-orange me-2 mb-1" />
            {lectures} lectures
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;