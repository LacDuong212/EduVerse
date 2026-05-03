import { Card, CardBody, CardFooter, CardTitle } from "react-bootstrap";
import { FaBook, FaRegClock, FaStar, FaUserGraduate } from "react-icons/fa";
import { Link } from "react-router-dom";
import { DEFAULT_COURSE_IMG } from "@/contexts/constants";
import { formatCurrency } from "@/utils/currency";
import { secondsToHours } from "@/utils/duration";

const CommonCourseCard = ({ course }) => {
  const {
    courseId,
    thumbnail,
    ratingCount = 0,
    studentsEnrolled: students,
    lecturesCount,
    instructor,
  } = course;

  const title = course.title || "Untitled";
  const subtitle = course.subtitle;

  const averageRating = course.ratingTotal && course.ratingCount !== 0
    ? (course.ratingTotal / course.ratingCount).toFixed(1)
    : 0;

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
    : "-";

  const levelBadge = {
    class: "bg-info",
    text: course.level?.toUpperCase() || "",
  };

  const categoryBadge = {
    class: "bg-primary",
    text: course.category?.name?.toUpperCase() || "",
  };

  const detailPath = courseId ? `/courses/${courseId}` : "/courses";

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_COURSE_IMG;
  };

  return (
    <Card className="border">
      {isFree ? (
        <div className="ribbon"><span>Free</span></div>
      ) : hasDiscount ? (
        <div className="ribbon"><span>{`-${discountPercent}%`}</span></div>
      ) : null}

      <Link to={`/courses/${courseId || ""}`}>
        <img
          src={thumbnail || DEFAULT_COURSE_IMG}
          className="card-img-top"
          alt={title}
          onError={handleImageError}
          style={{ cursor: courseId ? "pointer" : "default" }}
        />
      </Link>

      <CardBody className="pb-0 d-flex flex-column flex-grow-1">
        <div className="d-flex justify-content-between mb-3">
          <div className="d-flex flex-wrap gap-1">
            <span className={`badge ${levelBadge.class} bg-opacity-60`}>{levelBadge.text}</span>
            <span className={`badge ${categoryBadge.class} bg-opacity-60`}>{categoryBadge.text}</span>
          </div>
        </div>

        <CardTitle className="mb-2">
          <Link
            to={detailPath}
            className="text-decoration-none text-truncate-2"
            title={title}
          >
            {title}
          </Link>
        </CardTitle>

        {subtitle && <p className="mb-2 text-truncate-2">{subtitle}</p>}

        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="h6 fw-light mb-0">
            <FaStar className="text-warning mb-1 me-2" />
            {`${averageRating} (${ratingCount} ${ratingCount === 1 ? "rating" : "ratings"})`}
          </span>
          <span className="h6 fw-light mb-0">
            <FaUserGraduate className="text-success mb-1 me-2" />
            {students} {students === 1 ? "student" : "students"}
          </span>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <span className="h6 fw-light mb-0">
            <FaRegClock className="text-danger mb-1 me-2" />
            {durationText}
          </span>
          <span className="h6 fw-light mb-0">
            <FaBook className="text-orange mb-1 me-2" />
            {lecturesCount} {lecturesCount === 1 ? "lecture" : "lectures"}
          </span>
        </div>
      </CardBody>

      <CardFooter className="pt-0 bg-transparent">
        <hr />
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div className="avatar avatar-sm flex-shrink-0">
              {instructor?.avatar ? (
                <img
                  src={instructor?.avatar}
                  className="rounded-3"
                  alt={"avatar"}
                />
              ) : (
                <div className="avatar-img rounded-3 border border-body border-1 d-flex align-items-center justify-content-center fw-bold fs-4">
                  {(instructor?.name?.[0] || "INS").toUpperCase()}
                </div>
              )}
            </div>
            <Link to={`/instructors/${instructor.insId || ""}`}>
              <p className="mb-0 ms-2">
                <span className="h6 fw-light mb-0 text-wrap" style={{ maxWidth: "120px", display: "inline-block" }}>{instructor.name}</span>
              </p>
            </Link>
          </div>

          <div className="text-end">
            <div className="d-flex flex-column align-items-end">
              {hasDiscount && !isFree && (
                <span className="small text-body text-decoration-line-through">
                  {formatCurrency(price)}
                </span>
              )}
              <h4 className="text-success mb-0">
                {isFree ? "Free" : formatCurrency(hasDiscount ? discountPrice : price)}
              </h4>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CommonCourseCard;