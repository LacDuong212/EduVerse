import TinySlider from '@/components/TinySlider';
import { formatCurrency } from '@/utils/currency';
import useCourseDetail from '../useCourseDetail';
import { Card, CardBody, CardTitle, Container, Row } from 'react-bootstrap';
import { renderToString } from 'react-dom/server';
import { FaChevronLeft, FaChevronRight, FaCircle, FaShoppingCart, FaStar, FaUserGraduate } from 'react-icons/fa';
import { useEffect, useMemo } from 'react';
const CourseCard = ({
  course
}) => {
  const {
    thumbnail,
    discountPrice,
    studentsEnrolled,
    ratingAverage = course?.rating?.average,
    instructorAvatar = course?.instructor?.avatar,
    title
  } = course;
  return <Card className="p-2 border">
    <div className="rounded-top overflow-hidden">
      <div className="card-overlay-hover">
        <img src={thumbnail} className="card-img-top" alt="course image" />
      </div>
      <div className="card-img-overlay">
        <div className="card-element-hover d-flex justify-content-end">
          <a href="#" className="icon-md bg-white rounded-circle text-center">
            <FaShoppingCart className="text-danger" />
          </a>
        </div>
      </div>
    </div>
    <CardBody>
      <div className="d-flex justify-content-between">
        <ul className="list-inline hstack gap-2 mb-0">
          <li className="list-inline-item d-flex justify-content-center align-items-center">
            <div className="icon-md bg-orange bg-opacity-10 text-orange rounded-circle">
              <FaUserGraduate />
            </div>
            <span className="h6 fw-light ms-2 mb-0">{studentsEnrolled}</span>
          </li>
          <li className="list-inline-item d-flex justify-content-center align-items-center">
            <div className="icon-md bg-warning bg-opacity-15 text-warning rounded-circle">
              <FaStar />
            </div>
            <span className="h6 fw-light ms-2 mb-0">{ratingAverage}</span>
          </li>
        </ul>
        <div className="avatar avatar-sm">
          <img className="avatar-img rounded-circle" src={instructorAvatar} alt="avatar" />
        </div>
      </div>
      <hr />
      <CardTitle>
        <a href="#">{title}</a>
      </CardTitle>
      <div className="d-flex justify-content-between align-items-center">
        <h3 className="text-success mb-0">
          {formatCurrency(discountPrice)}
        </h3>
      </div>
    </CardBody>
  </Card>;
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
  useEffect(() => {
    if(relatedCourses) console.log('Related Courses loaded:', relatedCourses.length);
  }, [relatedCourses]);

  if (!relatedCourses || relatedCourses.length === 0) return null;

  return <section className="pt-0">
    <Container>
      <Row className="mb-4">
        <h2 className="mb-0">Related Courses</h2>
      </Row>
      <Row>
        <div className="tiny-slider arrow-round arrow-blur arrow-hover">
          {relatedCourses &&
            <TinySlider settings={courseSliderSettings}>
              {relatedCourses.slice(1, 5).map((course, idx) => (
                <div className="pb-4" key={idx}>
                  <CourseCard course={course} />
                </div>
              ))}
            </TinySlider>
          }
        </div>
      </Row>
    </Container>
  </section>;
};
export default ListedCourses;
