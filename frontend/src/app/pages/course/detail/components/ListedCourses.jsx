import TinySlider from '@/components/TinySlider';
import { currency } from '@/context/constants';
import { getAllCourses } from '@/helpers/data';
import { useFetchData } from '@/hooks/useFetchData';
import { toAlphaNumber } from '@/utils/change-casing';
import { Card, CardBody, CardTitle, Container, Row } from 'react-bootstrap';
import { renderToString } from 'react-dom/server';
import { FaChevronLeft, FaChevronRight, FaCircle, FaShoppingCart, FaStar, FaUserGraduate } from 'react-icons/fa';
const CourseCard = ({
  course
}) => {
  const {
    studentImage,
    price,
    label,
    students,
    rating,
    avatar,
    title
  } = course;
  return <Card className="p-2 border">
      <div className="rounded-top overflow-hidden">
        <div className="card-overlay-hover">
          <img src={studentImage} className="card-img-top" alt="course image" />
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
              <span className="h6 fw-light ms-2 mb-0">{toAlphaNumber(students)}</span>
            </li>
            <li className="list-inline-item d-flex justify-content-center align-items-center">
              <div className="icon-md bg-warning bg-opacity-15 text-warning rounded-circle">
                <FaStar />
              </div>
              <span className="h6 fw-light ms-2 mb-0">{rating.star}</span>
            </li>
          </ul>
          <div className="avatar avatar-sm">
            <img className="avatar-img rounded-circle" src={avatar} alt="avatar" />
          </div>
        </div>
        <hr />
        <CardTitle>
          <a href="#">{title}</a>
        </CardTitle>
        <div className="d-flex justify-content-between align-items-center">
          <a href="#" className="badge bg-info bg-opacity-10 text-info">
            <FaCircle className="small fw-bold me-2" />
            {label}
          </a>
          <h3 className="text-success mb-0">
            {currency}
            {price}
          </h3>
        </div>
      </CardBody>
    </Card>;
};
const ListedCourses = () => {
  const listCourses = useFetchData(getAllCourses);
  const courseSliderSettings = {
    arrowKeys: true,
    gutter: 30,
    autoplayButton: false,
    autoplayButtonOutput: false,
    nested: 'inner',
    mouseDrag: true,
    controlsText: [renderToString(<FaChevronLeft size={16} />), renderToString(<FaChevronRight size={16} />)],
    autoplay: false,
    controls: true,
    edgePadding: 2,
    items: 3,
    nav: false,
    responsive: {
      1: {
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
  return <section className="pt-0">
      <Container>
        <Row className="mb-4">
          <h2 className="mb-0">Top Listed Courses</h2>
        </Row>
        <Row>
          <div className="tiny-slider arrow-round arrow-blur arrow-hover">
            {listCourses && <TinySlider settings={courseSliderSettings}>
                {listCourses.slice(1, 5).map((course, idx) => <div className="pb-4" key={idx}>
                    <CourseCard course={course} />
                  </div>)}
              </TinySlider>}
          </div>
        </Row>
      </Container>
    </section>;
};
export default ListedCourses;
