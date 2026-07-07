import { FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";

// Formats a VND price for display inside the compact chat card.
const formatPrice = (value, language) =>
  new Intl.NumberFormat(language === "vi" ? "vi-VN" : "en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

// Renders a single recommended course as a compact horizontal card.
export default function CourseCard({ course, language = "en" }) {
  if (!course) return null;

  const {
    courseId,
    title,
    thumbnail,
    image,
    price,
    discountPrice,
    enableDiscount,
    isFree,
    ratingTotal,
    ratingCount,
    instructor,
  } = course;

  const effectivePrice = enableDiscount ? (discountPrice ?? price) : price;
  const avgRating = ratingCount > 0 ? (ratingTotal / ratingCount).toFixed(1) : null;
  const cover = thumbnail || image;

  return (
    <Link
      to={`/courses/${courseId}`}
      className="d-flex gap-2 text-decoration-none text-body bg-light rounded p-2 border mb-2"
      style={{ transition: "background-color 0.15s" }}
    >
      {cover && (
        <img
          src={cover}
          alt={title}
          className="rounded flex-shrink-0"
          style={{ width: "64px", height: "48px", objectFit: "cover" }}
        />
      )}

      <div className="flex-grow-1 overflow-hidden">
        <div className="fw-bold small text-truncate">{title}</div>

        {instructor?.name && (
          <div className="text-body text-truncate" style={{ fontSize: "0.72rem" }}>
            {instructor.name}
          </div>
        )}

        <div className="d-flex align-items-center gap-2 mt-1">
          {avgRating && (
            <span className="d-flex align-items-center gap-1" style={{ fontSize: "0.72rem" }}>
              <FaStar className="text-warning" size={11} />
              {avgRating}
            </span>
          )}
          <span className="fw-bold text-primary" style={{ fontSize: "0.78rem" }}>
            {isFree
              ? (language === "vi" ? "Miễn phí" : "Free")
              : formatPrice(effectivePrice, language)}
          </span>
        </div>
      </div>
    </Link>
  );
}
