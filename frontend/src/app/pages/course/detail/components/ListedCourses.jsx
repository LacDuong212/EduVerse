import TinySlider from '@/components/TinySlider';
import { formatCurrency } from '@/utils/currency';
import useCourseDetail from '../useCourseDetail';
import { Card, CardBody, CardFooter, CardTitle, Container, Row } from 'react-bootstrap';
import { renderToString } from 'react-dom/server';
import { FaChevronLeft, FaChevronRight, FaStar, FaUserGraduate, FaRegClock, FaTable } from 'react-icons/fa';
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

const DEFAULT_COURSE_IMG = "https://res.cloudinary.com/dw1fjzfom/image/upload/v1764427835/course_default_image_pwqnyo.jpg";

const CourseCard = ({ course }) => {
  const {
    _id,
    title,
    thumbnail,
    price,
    discountPrice,
    studentsEnrolled,
    ratingAverage = course?.rating?.average || 0,
    reviewCount = course?.rating?.count || 0,
    instructorAvatar = course?.instructor?.avatar,
    instructorName = course?.instructor?.username || "Instructor",
    category = "Development",
    level = "All level",
    duration,
    lecturesCount
  } = course;

  const isFree = (discountPrice ?? price) === 0;
  const hasDiscount = Number.isFinite(discountPrice) && price && discountPrice < price;
  const detailPath = _id ? `/courses/${_id}` : '#';

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_COURSE_IMG;
  };

  return (
    <Card className="action-trigger-hover border bg-transparent position-relative h-100">
      <Link to={detailPath}>
        <img
          src={thumbnail || DEFAULT_COURSE_IMG}
          className="card-img-top"
          alt={title}
          onError={handleImageError}
          style={{
            cursor: _id ? 'pointer' : 'default',
            height: '240px',
            width: '100%',
            objectFit: 'cover'
          }}
        />
      </Link>

      <CardBody className="pb-0">
        <div className="d-flex justify-content-between mb-3">
          <span className="hstack gap-2">
            <span className="badge bg-primary bg-opacity-10 text-primary">
              {typeof category === 'string' ? category : 'Course'}
            </span>
            <span className="badge text-bg-dark">{level}</span>
          </span>
        </div>

        <CardTitle className="mb-2">
          <Link
            to={detailPath}
            className="text-decoration-none text-truncate-2"
            style={{ 
              cursor: _id ? 'pointer' : 'default', 
              display: '-webkit-box', 
              WebkitLineClamp: 2, 
              WebkitBoxOrient: 'vertical', 
              overflow: 'hidden',
              minHeight: '48px'
            }}
            title={title}
          >
            {title}
          </Link>
        </CardTitle>

        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="hstack gap-2">
            <p className="text-warning m-0">
              {ratingAverage} <FaStar className="text-warning ms-1" />
            </p>
            <span className="small">({reviewCount})</span>
          </div>
          <div className="hstack gap-2">
            <div className="icon-sm bg-orange bg-opacity-10 text-orange rounded-circle">
                <FaUserGraduate size={12}/>
            </div>
            <span className="small">{studentsEnrolled} students</span>
          </div>
        </div>

        {/* Duration & Lectures (Hiển thị nếu có dữ liệu) */}
        {(duration || lecturesCount) && (
            <div className="hstack gap-3 mb-2">
            {duration && (
                <span className="h6 fw-light mb-0 small">
                <FaRegClock className="text-danger me-1" />
                {duration}
                </span>
            )}
            {lecturesCount && (
                <span className="h6 fw-light mb-0 small">
                <FaTable className="text-orange me-1" />
                {lecturesCount} lectures
                </span>
            )}
            </div>
        )}
      </CardBody>

      <CardFooter className="pt-0 bg-transparent">
        <hr />
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div className="avatar avatar-sm">
              <img 
                className="avatar-img rounded-1" 
                src={instructorAvatar || DEFAULT_COURSE_IMG} 
                alt="avatar" 
                onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150"; }}
              />
            </div>
            <p className="mb-0 ms-2">
              <span className="h6 fw-light mb-0 text-truncate" style={{ maxWidth: '100px', display: 'inline-block' }}>
                {instructorName}
              </span>
            </p>
          </div>

          {/* Price Info */}
          <div className="text-end">
            {isFree ? (
              <h4 className="text-success mb-0">Free</h4>
            ) : hasDiscount ? (
              <>
                <div className="small text-muted text-decoration-line-through">
                   {price ? formatCurrency(price) : ''}
                </div>
                <h4 className="text-success mb-0">
                  {formatCurrency(discountPrice)}
                </h4>
              </>
            ) : (
              <h4 className="text-success mb-0">
                {formatCurrency(discountPrice || price)}
              </h4>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

const ListedCourses = () => {
  const { relatedCourses } = useCourseDetail();
  
  const courseSliderSettings = useMemo(() => ({
    arrowKeys: true,
    gutter: 30,
    autoplayButton: false,
    autoplayButtonOutput: false,
    controlsText: [
      renderToString(<FaChevronLeft size={16} />),
      renderToString(<FaChevronRight size={16} />)
    ],
    autoplay: true,
    controls: true,
    edgePadding: 2,
    items: 3,
    nav: false,
    responsive: {
      0: { items: 1 },
      576: { items: 1 },
      768: { items: 2 },
      992: { items: 2 },
      1200: { items: 3 }
    }
  }), []);

  // useEffect(() => {
  //   if (relatedCourses) console.log('Related Courses loaded:', relatedCourses.length);
  // }, [relatedCourses]);

  if (!relatedCourses || relatedCourses.length === 0) return null;

  return (
    <section className="pt-0">
      <Container>
        <Row className="mb-4">
          <h2 className="mb-0">Related Courses</h2>
        </Row>
        <Row>
          <div className="tiny-slider arrow-round arrow-blur arrow-hover">
            {relatedCourses && (
              <TinySlider settings={courseSliderSettings}>
                {relatedCourses.map((course, idx) => (
                  <div className="pb-4" key={idx}>
                    <CourseCard course={course} />
                  </div>
                ))}
              </TinySlider>
            )}
          </div>
        </Row>
      </Container>
    </section>
  );
};

export default ListedCourses;