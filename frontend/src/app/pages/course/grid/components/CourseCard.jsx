import { Card, CardBody, CardFooter, CardTitle } from 'react-bootstrap';
import { FaRegClock, FaRegHeart, FaRegStar, FaStar, FaStarHalfAlt, FaTable } from 'react-icons/fa';
const CourseCard = ({
  course
}) => {
  const {
    image,
    title,
    description,
    rating,
    duration,
    lectures,
    badge
  } = course;
  return <Card className="shadow h-100">
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
          {Array(Math.floor(rating.star)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small">
                <FaStar size={14} className="text-warning" />
              </li>)}
          {!Number.isInteger(rating.star) && <li className="list-inline-item me-1 small">

              <FaStarHalfAlt size={14} className="text-warning" />
            </li>}
          {rating.star < 5 && Array(5 - Math.ceil(rating.star)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small">
                  <FaRegStar size={14} className="text-warning" />
                </li>)}
          <li className="list-inline-item ms-2 h6 fw-light mb-0">{rating.star}/5.0</li>
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
    </Card>;
};
export default CourseCard;
