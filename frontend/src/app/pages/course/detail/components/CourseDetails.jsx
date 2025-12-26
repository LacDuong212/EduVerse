import GlightBox from '@/components/GlightBox';
import { useVideoStream } from '@/hooks/useStreamUrl';
import { formatCurrency } from '@/utils/currency';
import { secondsToDurationHM } from '@/utils/duration';
import Curriculum from './Curriculum';
import Instructor from './Instructor';
import Overview from './Overview';

import { useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContainer,
  TabContent,
  TabPane
} from 'react-bootstrap';
import {
  FaBookOpen,
  FaClock,
  FaGlobe,
  FaPlay,
  FaSignal,
} from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';


const PricingCard = ({ course, owned, onShowCurriculum, onAddToCart, courseId }) => {
  const { streamUrl, loading: videoLoading, error: videoError } = useVideoStream(
    courseId,
    course?.previewVideo
  );

  const getEmbedUrl = (url) => {
    if (!url) return null;

    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (url.includes('watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }

    if (url.includes('shorts/')) {
      const videoId = url.split('shorts/')[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    return url;
  };

  const previewHref = getEmbedUrl(streamUrl || course?.previewVideo);

  return (
    <Card className="shadow p-2 mb-4 z-index-9">
      <div className="overflow-hidden rounded-3">
        <img src={course?.thumbnail} className="card-img" alt="course image" />
        <div className="bg-overlay bg-dark opacity-1" />
        <div className="card-img-overlay d-flex align-items-start flex-column p-3">
          <div className="m-auto">
            <GlightBox
              href={previewHref}
              className="btn btn-lg text-danger btn-round btn-white-shadow mb-0"
              data-glightbox="type: video"
              data-gallery="course-video"
              data-type="video"
            >
              <FaPlay />
            </GlightBox>
          </div>
        </div>
      </div>

      <CardBody className="px-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="d-flex align-items-center">
              {(() => {
                const original = Number(course?.price ?? 0);
                const sale = Number(course?.discountPrice ?? original);
                const percent =
                  original > 0 && sale < original
                    ? Math.round(((original - sale) / original) * 100)
                    : 0;

                return (
                  <div className="d-flex align-items-center">
                    <h3 className="fw-bold mb-0 me-2 fs-5">
                      {formatCurrency(sale)}
                    </h3>
                    {percent > 0 && (
                      <>
                        <span className="text-decoration-line-through mb-0 me-2 fs-6">
                          {formatCurrency(original)}
                        </span>
                        <span className="badge text-bg-orange mb-0">
                          {percent}% off
                        </span>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {owned ? (
          <div className="mt-4">
            <Button
              variant="success"
              className="w-100"
              onClick={onShowCurriculum}
            >
              Continue Learning
            </Button>
          </div>
        ) : (
          <div className="mt-4">
            <Button
              variant="success"
              className="w-100"
              onClick={onAddToCart}
            >
              Add to Cart
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

const Tags = ({ tags = [] }) => {
  return (
    <Card className="card-body shadow p-4">
      <h4 className="mb-3">Tags</h4>
      <ul className="list-inline mb-0">
        {tags.map((tag, idx) => (
          <li className="list-inline-item" key={idx}>
            <Button
              as={Link}
              to={`/courses?search=${encodeURIComponent(tag)}`}
              variant="outline-light"
              size="sm"
            >
              {tag}
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
};

const CourseDetails = ({ course, owned, onAddToCart }) => {
  const [activeKey, setActiveKey] = useState('overview'); // tab mặc định

  const navigate = useNavigate();
  const { id } = useParams();

  const handleSelectTab = (k) => {
    if (!k) return;

    // nếu user đã mua course và bấm Curriculum -> chuyển sang trang học
    if (k === 'curriculum' && owned) {
      const courseId = course?._id || id;
      if (courseId) {
        navigate(`/student/courses/${courseId}`);
        return;
      }
    }

    setActiveKey(k);
  };

  return (
    <section className="pb-0 py-lg-5">
      <Container>
        <Row>
          <Col lg={8}>
            <Card className="shadow rounded-2 p-0">
              {/* ✅ dùng activeKey + handleSelectTab */}
              <TabContainer activeKey={activeKey} onSelect={handleSelectTab}>
                <CardHeader className="border-bottom px-4 py-3">
                  <Nav
                    className="nav-pills nav-tabs-line py-0"
                    id="course-pills-tab"
                    role="tablist"
                  >
                    <NavItem className="me-2 me-sm-4" role="presentation">
                      <NavLink
                        as="button"
                        eventKey="overview"
                        className="mb-2 mb-md-0"
                        type="button"
                        role="tab"
                      >
                        Overview
                      </NavLink>
                    </NavItem>
                    <NavItem className="me-2 me-sm-4" role="presentation">
                      <NavLink
                        as="button"
                        eventKey="curriculum"
                        className="mb-2 mb-md-0"
                        type="button"
                        role="tab"
                      >
                        Curriculum
                      </NavLink>
                    </NavItem>
                    <NavItem className="me-2 me-sm-4" role="presentation">
                      <NavLink
                        as="button"
                        eventKey="instructor"
                        className="mb-2 mb-md-0"
                        type="button"
                        role="tab"
                      >
                        Instructor
                      </NavLink>
                    </NavItem>
                    {/* <NavItem className="me-2 me-sm-4" role="presentation">
                      <NavLink
                        as="button"
                        eventKey="reviews"
                        className="mb-2 mb-md-0"
                        type="button"
                        role="tab"
                      >
                        Reviews
                      </NavLink>
                    </NavItem>
                    <NavItem className="me-2 me-sm-4" role="presentation">
                      <NavLink
                        as="button"
                        eventKey="faqs"
                        className="mb-2 mb-md-0"
                        type="button"
                        role="tab"
                      >
                        FAQs
                      </NavLink>
                    </NavItem>
                    <NavItem className="me-2 me-sm-4" role="presentation">
                      <NavLink
                        as="button"
                        eventKey="comment"
                        className="mb-2 mb-md-0"
                        type="button"
                        role="tab"
                      >
                        Comment
                      </NavLink>
                    </NavItem> */}
                  </Nav>
                </CardHeader>
                <CardBody className="p-4">
                  <TabContent id="course-pills-tabContent">
                    <TabPane eventKey="overview" className="fade" role="tabpanel">
                      <Overview />
                    </TabPane>

                    <TabPane
                      eventKey="curriculum"
                      className="fade"
                      role="tabpanel"
                    >
                      <Curriculum
                        coursePrice={course?.discountPrice || course?.price || 0}
                        premiumAction={onAddToCart}
                      />
                    </TabPane>

                    <TabPane
                      eventKey="instructor"
                      className="fade"
                      role="tabpanel"
                    >
                      <Instructor instructor={course?.instructor} />
                    </TabPane>
                    {/* <TabPane
                      eventKey="reviews"
                      className="fade"
                      role="tabpanel"
                    >
                      <Reviews />
                    </TabPane>
                    <TabPane eventKey="faqs" className="fade" role="tabpanel">
                      <Faqs />
                    </TabPane>
                    <TabPane eventKey="comment" className="fade" role="tabpanel">
                      <Comment />
                    </TabPane> */}
                  </TabContent>
                </CardBody>
              </TabContainer>
            </Card>
          </Col>
          <Col lg={4} className="pt-5 pt-lg-0">
            <Row className="mb-5 mb-lg-0">
              <Col md={6} lg={12}>
                <PricingCard
                  course={course}
                  owned={owned}
                  courseId={course?._id || id}
                  onShowCurriculum={() => {
                    if (owned) {
                      const courseId = course?._id || id;
                      navigate(`/student/courses/${courseId}`);
                    } else {
                      setActiveKey('curriculum');
                    }
                  }}
                  onAddToCart={onAddToCart}
                />

                <Card className="card-body shadow p-4 mb-4">
                  <h4 className="mb-3">This course includes</h4>
                  <ul className="list-group list-group-borderless">
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="h6 fw-light mb-0">
                        <FaBookOpen className="fa-fw text-primary me-1" />
                        Lectures
                      </span>
                      <span>{course?.lecturesCount}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="h6 fw-light mb-0">
                        <FaClock className="fa-fw text-primary me-1" />
                        Duration
                      </span>
                      <span>{secondsToDurationHM(course?.duration)}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="h6 fw-light mb-0">
                        <FaSignal className="fa-fw text-primary me-1" />
                        Level
                      </span>
                      <span>{course?.level}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="h6 fw-light mb-0">
                        <FaGlobe className="fa-fw text-primary me-1" />
                        Language
                      </span>
                      <span>{course?.language}</span>
                    </li>
                  </ul>
                </Card>
              </Col>
              <Col md={6} lg={12}>
                <Tags tags={course?.tags || []} />
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default CourseDetails;
