import TinySlider from '@/components/TinySlider';
import { currency } from '@/context/constants';
import { useFetchData } from '@/hooks/useFetchData';
import { Card, CardBody, CardFooter, CardTitle } from 'react-bootstrap';
import { renderToString } from 'react-dom/server';
import { FaChevronLeft, FaChevronRight, FaRegBookmark, FaRegClock, FaShoppingCart, FaStar, FaTable } from 'react-icons/fa';
import { getAllCourses } from '@/helpers/data';
const TrendingCourseCard = ({
  course
}) => {
  const {
    name,
    duration,
    avatar,
    studentImage,
    badge,
    rating,
    title,
    price,
    students,
    lectures,
    category
  } = course;
  return <Card className="action-trigger-hover border bg-transparent">
      <img src={studentImage} className="card-img-top" alt="course image" />
      {price === 0 && <div className="ribbon mt-3">
          <span>Free</span>
        </div>}
      <CardBody className="pb-0">
        <div className="d-flex justify-content-between mb-3">
          <span className="hstack gap-2">
            <a href="#" className="badge bg-primary bg-opacity-10 text-primary">
              {category}
            </a>
            <a href="#" className="badge text-bg-dark">
              {badge.text}
            </a>
          </span>
          <a href="#" className="h6 fw-light mb-0">
            <FaRegBookmark />
          </a>
        </div>
        <CardTitle>
          <a href="#">{title}</a>
        </CardTitle>
        <div className="d-flex justify-content-between mb-2">
          <div className="hstack gap-2">
            <p className="text-warning m-0">
              {rating.star}
              <FaStar className="text-warning ms-1" />
            </p>
            <span className="small">({rating.review})</span>
          </div>
          <div className="hstack gap-2">
            <p className="h6 fw-light mb-0 m-0">{students}</p>
            <span className="small">(Student)</span>
          </div>
        </div>
        <div className="hstack gap-3">
          <span className="h6 fw-light mb-0">
            <FaRegClock className="text-danger me-2" />
            {duration}
          </span>
          <span className="h6 fw-light mb-0">
            <FaTable className="text-orange me-2" />
            {lectures} lectures
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
              <a href="#" className="h6 fw-light mb-0">
                {name}
              </a>
            </p>
          </div>
          <div>
            <h4 className="text-success mb-0 item-show">{price === 0 ? 'Free' : `${currency}${price}`}</h4>
            <a href="#" className="btn btn-sm btn-success-soft item-show-hover">
              <FaShoppingCart className="me-2" />
              Add to cart
            </a>
          </div>
        </div>
      </CardFooter>
    </Card>;
};
const TrendingCourseSlider = () => {
  const trendingCourses = useFetchData(getAllCourses);
  const courseSliderSettings = {
    arrowKeys: true,
    gutter: 30,
    autoplayButton: false,
    autoplayButtonOutput: false,
    // nested: 'inner',
    controlsText: [renderToString(<FaChevronLeft size={16} />), renderToString(<FaChevronRight size={16} />)],
    autoplay: true,
    controls: true,
    edgePadding: 2,
    items: 3,
    nav: false,
    responsive: {
      0: {
        items: 1
      },
      576: {
        items: 1
      },
      768: {
        items: 2
      },
      992: {
        items: 2
      },
      1200: {
        items: 3
      }
    }
  };
  return trendingCourses && <TinySlider settings={courseSliderSettings} className="pb-1">
        {trendingCourses?.slice(0, 4).map((course, idx) => <div key={idx}>
            <TrendingCourseCard course={course} />
          </div>)}
      </TinySlider>;
};
export default TrendingCourseSlider;
