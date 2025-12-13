import CourseCard from '@/components/CourseCard';
import { Card, CardBody, CardFooter, CardTitle, Col } from 'react-bootstrap';
import { FaRegClock, FaRegHeart, FaRegStar, FaStar, FaStarHalfAlt, FaTable } from 'react-icons/fa';

const CourseCardItem = ({ course }) => {
  const {
    id,
    image,
    title,
    subtitle,
    rating,
    duration,
    badge
  } = course;

  const imageSrc = image || 'https://res.cloudinary.com/dw1fjzfom/image/upload/v1757337425/course-placeholder.png';
  const status = course.status || '';
  const badgeClass = typeof badge === 'string' ? badge : (badge?.className || {
    Live: 'bg-success',
    Pending: 'bg-warning',
    Blocked: 'bg-danger',
    Rejected: 'bg-danger'
  }[status] || 'bg-primary');
  const badgeText = typeof badge === 'string' ? badge : (badge?.text || (course.enableDiscount ? 'Sale' : (status || 'New')));
  const safeRating = Number.isFinite(rating?.average) ? Math.max(0, Math.min(5, rating.average)) : 0;
  const fullStars = Math.floor(safeRating);
  const halfStar = !Number.isInteger(safeRating) && safeRating - fullStars >= 0.5;

  return (
    <Card className="shadow shadow-sm h-100">
      <img src={imageSrc} className="card-img-top" alt={title || 'course image'} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
      <CardBody className="pb-0">
        <div className="d-flex justify-content-between mb-2">
          <a href="#" className={`badge ${badgeClass}`}>
            {badgeText}
          </a>
          <a href="#" className="h6 fw-light mb-0">
            <FaRegHeart />
          </a>
        </div>
        <CardTitle>
          <a href={`/instructor/courses/${id || ''}`}>{title}</a>
        </CardTitle>
        <p className="mb-2 text-truncate-2">{subtitle}</p>
        <ul className="list-inline mb-0">
          {Array(fullStars).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small">
            <FaStar size={14} className="text-warning" />
          </li>)}
          {halfStar && <li className="list-inline-item me-1 small">
            <FaStarHalfAlt size={14} className="text-warning" />
          </li>}
          {safeRating < 5 && Array(5 - Math.ceil(safeRating)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small">
            <FaRegStar size={14} className="text-warning" />
          </li>)}
          <li className="list-inline-item ms-2 h6 fw-light mb-0">{safeRating.toFixed(1)}/5.0</li>
        </ul>
      </CardBody>
      <CardFooter className="pt-0 pb-3">
        <hr />
        <div className="d-flex justify-content-between">
          <span className="h6 fw-light mb-0">
            <FaRegClock className="text-danger me-2" />
            {duration || "-"}h
          </span>
          <span className="h6 fw-light mb-0">
            <FaTable className="text-orange me-2" />
            {course.lecturesCount || course.lectures || 0} lectures
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};

const CoursesList = ({ coursesData = [] }) => {
  const list = Array.isArray(coursesData) ? coursesData : [];
  if (list.length === 0) return <div className="text-muted">No courses published yet.</div>;

  return (
    <>
      {list.map((course, idx) => <Col sm={6} key={idx} className="g-4">
        <CourseCard course={course} />
      </Col>)}
    </>
  );
};

export default CoursesList;