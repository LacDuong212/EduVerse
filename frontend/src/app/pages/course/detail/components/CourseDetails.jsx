import { Button, Card, CardBody, CardHeader, Col, Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Nav, NavItem, NavLink, Row, TabContainer, TabContent, TabPane } from 'react-bootstrap';
import Comment from './Comment';
import Curriculum from './Curriculum';
import Faqs from './Faqs';
import Instructor from './Instructor';
import Overview from './Overview';
import Reviews from './Reviews';
import GlightBox from '@/components/GlightBox';
import { currency } from '@/context/constants';
import { FaBookOpen, FaClock, FaCopy, FaFacebookSquare, FaGlobe, FaLinkedin, FaMedal, FaPlay, FaShareAlt, FaSignal, FaStar, FaStopwatch, FaTwitterSquare, FaUserClock } from 'react-icons/fa';
import courseImg1 from '@/assets/images/courses/4by3/01.jpg';
import courseImg18 from '@/assets/images/courses/4by3/18.jpg';
import courseImg21 from '@/assets/images/courses/4by3/21.jpg';
import { Link } from 'react-router-dom';
const PricingCard = () => {
  return <Card className="shadow p-2 mb-4 z-index-9">
      <div className="overflow-hidden rounded-3">
        <img src={courseImg1} className="card-img" alt="course image" />
        <div className="bg-overlay bg-dark opacity-6" />
        <div className="card-img-overlay d-flex align-items-start flex-column p-3">
          <div className="m-auto">
            <GlightBox href="https://www.youtube.com/embed/tXHviS-4ygo" className="btn btn-lg text-danger btn-round btn-white-shadow mb-0" data-glightbox data-gallery="course-video">
              <FaPlay />
            </GlightBox>
          </div>
        </div>
      </div>
      <CardBody className="px-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="d-flex align-items-center">
              <h3 className="fw-bold mb-0 me-2">{currency}150</h3>
              <span className="text-decoration-line-through mb-0 me-2">{currency}350</span>
              <span className="badge text-bg-orange mb-0">60% off</span>
            </div>
            <p className="mb-0 text-danger">
              <FaStopwatch className="me-2" />5 days left at this price
            </p>
          </div>
          <Dropdown>
            <DropdownToggle as="a" className="btn btn-sm btn-light rounded small arrow-none" role="button" id="dropdownShare" data-bs-toggle="dropdown" aria-expanded="false">
              <FaShareAlt className="fa-fw" />
            </DropdownToggle>
            <DropdownMenu className="dropdown-w-sm dropdown-menu-end min-w-auto shadow rounded" aria-labelledby="dropdownShare">
              <li>
                <DropdownItem href="#">
                  <FaTwitterSquare className="me-2" />
                  Twitter
                </DropdownItem>
              </li>
              <li>
                <DropdownItem href="#">
                  <FaFacebookSquare className="me-2" />
                  Facebook
                </DropdownItem>
              </li>
              <li>
                <DropdownItem href="#">
                  <FaLinkedin className="me-2" />
                  LinkedIn
                </DropdownItem>
              </li>
              <li>
                <DropdownItem href="#">
                  <FaCopy className="me-2" />
                  Copy link
                </DropdownItem>
              </li>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="mt-3 d-sm-flex justify-content-sm-between">
          <Button variant="outline-primary" className="mb-0">
            Free trial
          </Button>
          &nbsp;
          <Button variant="success" className="mb-0">
            Buy course
          </Button>
        </div>
      </CardBody>
    </Card>;
};
const RecentlyViewed = () => {
  return <Card className="card-body shadow p-4 mb-4">
      <h4 className="mb-3">Recently Viewed</h4>
      <Row className="gx-3 mb-3">
        <Col xs={4}>
          <img className="rounded" src={courseImg21} alt="course" />
        </Col>
        <Col xs={8}>
          <h6 className="mb-0">
            <Link to="">Fundamentals of Business Analysis</Link>
          </h6>
          <ul className="list-group list-group-borderless mt-1 d-flex justify-content-between">
            <li className="list-group-item px-0 d-flex justify-content-between">
              <span className="text-success">{currency}130</span>
              <span className="h6 fw-light">
                4.5
                <FaStar className="text-warning ms-1" />
              </span>
            </li>
          </ul>
        </Col>
      </Row>
      <Row className="gx-3">
        <Col xs={4}>
          <img className="rounded" src={courseImg18} alt="course" />
        </Col>
        <Col xs={8}>
          <h6 className="mb-0">
            <Link to="">The Complete Video Production Bootcamp</Link>
          </h6>
          <ul className="list-group list-group-borderless mt-1 d-flex justify-content-between">
            <li className="list-group-item px-0 d-flex justify-content-between">
              <span className="text-success">{currency}150</span>
              <span className="h6 fw-light">
                4.0
                <FaStar className="text-warning ms-1" />
              </span>
            </li>
          </ul>
        </Col>
      </Row>
    </Card>;
};
const PopularTags = () => {
  const tags = ['blog', 'business', 'theme', 'bootstrap', 'data science', 'web development', 'tips', 'machine learning'];
  return <Card className="card-body shadow p-4">
      <h4 className="mb-3">Popular Tags</h4>
      <ul className="list-inline mb-0">
        {tags.map((tag, idx) => <li className="list-inline-item" key={idx}>

            <Button variant="outline-light" size="sm">
              {tag}
            </Button>
          </li>)}
      </ul>
    </Card>;
};
const CourseDetails = () => {
  return <section className="pb-0 py-lg-5">
      <Container>
        <Row>
          <Col lg={8}>
            <Card className="shadow rounded-2 p-0">
              <TabContainer defaultActiveKey="overview">
                <CardHeader className="border-bottom px-4 py-3">
                  <Nav className="nav-pills nav-tabs-line py-0" id="course-pills-tab" role="tablist">
                    <NavItem className="me-2 me-sm-4" role="presentation">
                      <NavLink as="button" eventKey="overview" className="mb-2 mb-md-0" type="button" role="tab">
                        Overview
                      </NavLink>
                    </NavItem>
                    <NavItem className="me-2 me-sm-4" role="presentation">
                      <NavLink as="button" eventKey="curriculum" className="mb-2 mb-md-0" type="button" role="tab">
                        Curriculum
                      </NavLink>
                    </NavItem>
                    <NavItem className="me-2 me-sm-4" role="presentation">
                      <NavLink as="button" eventKey="instructor" className="mb-2 mb-md-0" type="button" role="tab">
                        Instructor
                      </NavLink>
                    </NavItem>
                    <NavItem className="me-2 me-sm-4" role="presentation">
                      <NavLink as="button" eventKey="reviews" className="mb-2 mb-md-0" type="button" role="tab">
                        Reviews
                      </NavLink>
                    </NavItem>
                    <NavItem className="me-2 me-sm-4" role="presentation">
                      <NavLink as="button" eventKey="faqs" className="mb-2 mb-md-0" type="button" role="tab">
                        FAQs
                      </NavLink>
                    </NavItem>
                    <NavItem className="me-2 me-sm-4" role="presentation">
                      <NavLink as="button" eventKey="comment" className="mb-2 mb-md-0" type="button" role="tab">
                        Comment
                      </NavLink>
                    </NavItem>
                  </Nav>
                </CardHeader>
                <CardBody className="p-4">
                  <TabContent className="pt-2" id="course-pills-tabContent">
                    <TabPane eventKey="overview" className="fade" role="tabpanel">
                      <Overview />
                    </TabPane>
                    <TabPane eventKey="curriculum" className="fade" role="tabpanel">
                      <Curriculum />
                    </TabPane>
                    <TabPane eventKey="instructor" className="fade" role="tabpanel">
                      <Instructor />
                    </TabPane>
                    <TabPane eventKey="reviews" className="fade" role="tabpanel">
                      <Reviews />
                    </TabPane>
                    <TabPane eventKey="faqs" className="fade" role="tabpanel">
                      <Faqs />
                    </TabPane>
                    <TabPane eventKey="comment" className="fade" role="tabpanel">
                      <Comment />
                    </TabPane>
                  </TabContent>
                </CardBody>
              </TabContainer>
            </Card>
          </Col>
          <Col lg={4} className="pt-5 pt-lg-0">
            <Row className="mb-5 mb-lg-0">
              <Col md={6} lg={12}>
                <PricingCard />
                <Card className="card-body shadow p-4 mb-4">
                  <h4 className="mb-3">This course includes</h4>
                  <ul className="list-group list-group-borderless">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="h6 fw-light mb-0">
                        <FaBookOpen className="fa-fw text-primary me-1" />
                        Lectures
                      </span>
                      <span>30</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="h6 fw-light mb-0">
                        <FaClock className="fa-fw text-primary me-1" />
                        Duration
                      </span>
                      <span>4h 50m</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="h6 fw-light mb-0">
                        <FaSignal className="fa-fw text-primary me-1" />
                        Skills
                      </span>
                      <span>Beginner</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="h6 fw-light mb-0">
                        <FaGlobe className="fa-fw text-primary me-1" />
                        Language
                      </span>
                      <span>English</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="h6 fw-light mb-0">
                        <FaUserClock className="fa-fw text-primary me-1" />
                        Deadline
                      </span>
                      <span>Nov 30 2021</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="h6 fw-light mb-0">
                        <FaMedal className="fa-fw text-primary me-1" />
                        Certificate
                      </span>
                      <span>Yes</span>
                    </li>
                  </ul>
                </Card>
              </Col>
              <Col md={6} lg={12}>
                <RecentlyViewed />
                <PopularTags />
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </section>;
};
export default CourseDetails;
