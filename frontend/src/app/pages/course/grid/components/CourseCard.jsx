import { Card, CardBody, CardFooter, CardTitle } from 'react-bootstrap';
import { FaRegClock, FaRegHeart, FaRegStar, FaStar, FaStarHalfAlt, FaTable } from 'react-icons/fa';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n ?? 0));

const CourseCard = ({ course }) => {
  // 👉 Hỗ trợ cả 2 schema: mock & backend thực
  const image = course.image || course.thumbnail ;
  const title = course.title || course.name || 'Untitled';

  // mock: description | thực: subtitle
  const description = course.description || course.subtitle || '';

  // mock: rating = { star } | thực: có thể là số hoặc không có
  const rawStar = typeof course?.rating === 'object'
    ? course?.rating?.star
    : course?.rating;
  const star = clamp(Number(rawStar), 0, 5); // ép số & giới hạn 0..5

  // mock: duration, lectures | thực: có thể không có → fallback
  const duration = course.duration || course.totalDuration || '—';
  const lectures = course.lectures ?? course.lectureCount ?? 0;

  // mock: badge = { class, text } | thực: không có → sinh nhẹ từ category/level nếu muốn
  const badge = course.badge || {
    class: 'bg-primary',
    text: course.level || course.category || 'Course',
  };

  const fullStars = Math.floor(star);
  const hasHalf = !Number.isNaN(star) && !Number.isInteger(star);
  const emptyStars = 5 - Math.ceil(star);

  return (
    <Card className="shadow h-100">
      <img src={image} className="card-img-top" alt="course image" />
      <CardBody className="pb-0">
        <div className="d-flex justify-content-between mb-2">
          <a href="#" className={`badge ${badge.class} bg-opacity-10`}>
            {badge.text}
          </a>
          <a href="#" className="h6 fw-light mb-0">
            <FaRegHeart />
          </a>
        </div>

        <CardTitle>
          <a href="#">{title}</a>
        </CardTitle>

        <p className="mb-2 text-truncate-2">{description}</p>

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
            {Number.isNaN(star) ? '—' : `${star}/5.0`}
          </li>
        </ul>
      </CardBody>

      <CardFooter className="pt-0 pb-3">
        <hr />
        <div className="d-flex justify-content-between">
          <span className="h6 fw-light mb-0">
            <FaRegClock className="text-danger me-2" />
            {duration}
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
