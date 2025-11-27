import TinySlider from '@/components/TinySlider';
import { useSelector } from 'react-redux';
import { Card, CardBody, CardFooter, CardTitle } from 'react-bootstrap';
import { renderToString } from 'react-dom/server';
import { FaChevronLeft, FaChevronRight, FaRegBookmark, FaRegClock, FaShoppingCart, FaStar, FaTable } from 'react-icons/fa';
import { formatCurrency } from '@/utils/currency';
// --- Card: thêm hiển thị discount ---
const BestSellersCard = ({ course }) => {
  const {
    name,
    duration,
    avatar,
    studentImage,
    badge,
    rating,
    title,
    price,
    discountPrice,        // NEW
    discountPercent,      // NEW
    students,
    lectures,
    category
  } = course;

  const isFree = (discountPrice ?? price) === 0;
  const hasDiscount = Number.isFinite(discountPrice) && discountPrice < price;

  return (
    <Card className="action-trigger-hover border bg-transparent position-relative">

      {/* Ribbon Free / -% */}
      {isFree ? (
        <div className="ribbon"><span>Free</span></div>
      ) : hasDiscount ? (
        <div className="ribbon"><span>{`-${discountPercent}%`}</span></div>
      ) : null}

      <img src={studentImage} className="card-img-top" alt="course image" />

      <CardBody className="pb-0">
        <div className="d-flex justify-content-between mb-3">
          <span className="hstack gap-2">
            <span className="badge bg-primary bg-opacity-10 text-primary">{category}</span>
            <span className="badge text-bg-dark">{badge.text}</span>
          </span>
          <span className="h6 fw-light mb-0" role="button" aria-label="bookmark">
            <FaRegBookmark />
          </span>
        </div>

        <CardTitle className="mb-2">
          <a href="#">{title}</a>
        </CardTitle>

        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="hstack gap-2">
            <p className="text-warning m-0">
              {rating.star}
              <FaStar className="text-warning ms-1" />
            </p>
            <span className="small">({rating.review})</span>
          </div>
          <div className="hstack gap-2">
            <p className="h6 fw-light mb-0 m-0">{students}</p>
            <span className="small">students</span>
          </div>
        </div>

        <div className="hstack gap-3">
          <span className="h6 fw-light mb-0">
            <FaRegClock className="text-danger me-2" />
            {duration}
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
              <a href="#" className="h6 fw-light mb-0">{name}</a>
            </p>
          </div>

          {/* Giá: Free / Discount / Normal */}
          <div className="text-end">
            {isFree ? (
              <h4 className="text-success mb-0 item-show">Free</h4>
            ) : hasDiscount ? (
              <>
                <div className="small text-muted text-decoration-line-through">
                  {formatCurrency(price)}
                </div>
                <h4 className="text-success mb-0 item-show">
                  {formatCurrency(discountPrice)}
                </h4>
              </>
            ) : (
              <h4 className="text-success mb-0 item-show">
                {formatCurrency(price)}
              </h4>
            )}

            <a href="#" className="btn btn-sm btn-success-soft item-show-hover mt-1">
              <FaShoppingCart className="me-2" />
              Add to cart
            </a>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

// --- Adapter: map dữ liệu API -> shape mà Card dùng ---
const adaptTrending = (c) => {
  const ratingAvg = Number.isFinite(c?.rating?.average) ? Number(c.rating.average) : 0;
  const ratingCount = Number.isFinite(c?.rating?.count) ? Number(c.rating.count) : 0;

  const instructorName = c?.instructor?.name ?? 'Unknown Instructor';
  const instructorAvatar = c?.instructor?.avatar ?? 'https://placehold.co/80x80?text=Instructor';

  const price = Number(c?.price ?? 0);
  const discountPrice = c?.discountPrice != null ? Number(c.discountPrice) : null;
  const hasDiscount = Number.isFinite(discountPrice) && discountPrice < price;
  const discountPercent = hasDiscount
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  const duration = Number.isFinite(c?.duration) ? `${c.duration}h` : (c?.duration || '—');

  return {
    name: instructorName,
    avatar: instructorAvatar,
    studentImage: c?.thumbnail || 'https://res.cloudinary.com/dw1fjzfom/image/upload/v1757337425/av4_khpvlh.png',
    badge: { text: c?.level || 'Course' },

    rating: { star: Number(ratingAvg.toFixed(1)), review: ratingCount },

    title: c?.title || 'Untitled',
    price,
    discountPrice,     // NEW
    discountPercent,   // NEW
    students: c?.studentsEnrolled ?? 0,
    duration,
    lectures: c?.lecturesCount ?? 0,
    category: c?.category || 'Others',

    _raw: c,
  };
};

// --- Slider ---
const BestSellersCourseSlider = ({ source = 'bestSellers' }) => {
  const coursesState = useSelector((s) => s.courses || {});
  const rawList = Array.isArray(coursesState[source]) ? coursesState[source] : [];
  const list = rawList.map(adaptTrending);

  const courseSliderSettings = {
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
  };

  if (!list.length) return null;

  return (
    <TinySlider settings={courseSliderSettings} className="pb-1">
      {list.slice(0, 8).map((course, idx) => (
        <div key={course._raw?._id || idx}>
          <BestSellersCard course={course} />
        </div>
      ))}
    </TinySlider>
  );
};

export default BestSellersCourseSlider;
