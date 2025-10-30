import { getAllCourses } from '@/helpers/data';
import { useFetchData } from '@/hooks/useFetchData';
import useToggle from '@/hooks/useToggle';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardFooter, CardTitle, Col, Container, Nav, NavItem, NavLink, Row, TabContainer, TabContent, TabPane } from 'react-bootstrap';
import { FaHeart, FaRegClock, FaRegHeart, FaRegStar, FaStar, FaStarHalfAlt, FaTable } from 'react-icons/fa';
const CourseCard = ({
  course
}) => {
  const {
    isTrue: isOpen,
    toggle
  } = useToggle();
  const {
    badge,
    description,
    duration,
    image,
    lectures,
    rating,
    title
  } = course;
  return <Card className="shadow h-100">
      <img src={image} className="card-img-top" alt="course image" />
      <CardBody className="pb-0">
        <div className="d-flex justify-content-between mb-2">
          <a href="#" className={clsx('badge bg-opacity-10', badge.class)}>
            {badge.text}
          </a>
          <span role="button" className="h6 mb-0" onClick={toggle}>
            {isOpen ? <FaHeart fill="red" /> : <FaRegHeart />}
          </span>
        </div>
        <CardTitle className="fw-normal">
          <Link to="">{title}</Link>
        </CardTitle>
        <p className="mb-2 text-truncate-2">{description}</p>
        {rating && <ul className="list-inline mb-0">
            {Array(Math.floor(rating.star)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small">
                  <FaStar className="text-warning" />
                </li>)}
            {!Number.isInteger(rating) && <li className="list-inline-item me-1 small">
                <FaStarHalfAlt className="text-warning" />
              </li>}
            {rating.star < 5 && Array(5 - Math.ceil(rating.star)).fill(0).map((_star, idx) => <li key={idx} className="list-inline-item me-1 small">
                    <FaRegStar className="text-warning" />
                  </li>)}
            <li className="list-inline-item ms-2 h6 fw-light mb-0">{rating.star}/5.0</li>
          </ul>}
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
const Courses = ({
  courseKey
}) => {
  const allCourses = useFetchData(getAllCourses);
  const filteredCourses = allCourses?.filter(course => course.category === courseKey);
  return <>
      <TabPane eventKey={courseKey} className="fade show" id="course-pills-tabs-1" role="tabpanel" aria-labelledby="course-pills-tab-1">
        <Row className="g-4">
          {filteredCourses?.map((course, idx) => <Col sm={6} lg={4} xl={3} key={idx}>
              <CourseCard course={course} />
            </Col>)}
        </Row>
      </TabPane>
    </>;
};
const PopularCourse = () => {
  const categories = ['web-design', 'development', 'graphic-design', 'marketing', 'finance'];
  return <section>
      <Container>
        <Row className="mb-4">
          <Col lg={8} className="mx-auto text-center">
            <h2 className="fs-1">Most Popular Courses</h2>
            <p className="mb-0">Choose from hundreds of courses from specialist organizations</p>
          </Col>
        </Row>
        <TabContainer defaultActiveKey="web-design">
          <Nav className="nav-pills nav-pills-bg-soft justify-content-sm-center mb-4 px-3" id="course-pills-tab" role="tablist">
            <NavItem className="me-2 me-sm-5">
              <NavLink as="button" eventKey="web-design" className="mb-2 mb-md-0" type="button" role="tab">
                Web Design
              </NavLink>
            </NavItem>
            <NavItem className="me-2 me-sm-5">
              <NavLink as="button" eventKey="development" className="mb-2 mb-md-0" type="button" role="tab">
                Development
              </NavLink>
            </NavItem>
            <NavItem className="me-2 me-sm-5">
              <NavLink as="button" eventKey="graphic-design" className="mb-2 mb-md-0" type="button" role="tab">
                Graphic Design
              </NavLink>
            </NavItem>
            <NavItem className="me-2 me-sm-5">
              <NavLink as="button" eventKey="marketing" className="mb-2 mb-md-0" type="button" role="tab">
                Marketing
              </NavLink>
            </NavItem>
            <NavItem className="me-2 me-sm-5">
              <NavLink as="button" eventKey="finance" className="mb-2 mb-md-0" type="button" role="tab">
                Finance
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent id="course-pills-tabContent">
            {categories.map((category, idx) => <Courses courseKey={category} key={idx} />)}
          </TabContent>
        </TabContainer>
      </Container>
    </section>;
};
export default PopularCourse;
