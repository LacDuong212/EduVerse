import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Container, Row, Col } from 'react-bootstrap';
import CourseCard from '@/components/CourseCard';

/** Adapter: đổi dữ liệu API -> props cho CourseCard của bạn */
const adaptToCard = (c) => {
  const star = typeof c?.rating?.average === 'number' ? c.rating.average : 0;

  return {
    title: c?.title || 'Untitled',
    description: c?.description || '',
    image: c?.thumbnail || '',
    lectures: c?.lecturesCount ?? 0,
    duration: c?.duration != null ? `${c.duration}h` : '',
    rating: { star },
    badge: {
      text: c?.level || 'Course',
      class: 'bg-primary bg-opacity-60',
    },
    _raw: c,
  };
};

const NewestCourses = () => {
  const newestCourses = useSelector((s) => s.courses?.newest || []);

  // Chuẩn bị list course
  const list = useMemo(() => (newestCourses || []).map(adaptToCard), [newestCourses]);

  return (
    <section>
      <Container>
        <Row className="mb-4">
          <Col lg={8} className="mx-auto text-center">
            <h2 className="fs-1">Newest Courses</h2>
            <p className="mb-0">
              Discover our latest courses and stay ahead with fresh, updated content.
            </p>
          </Col>
        </Row>

        <Row className="g-4">
          {list.map((course, idx) => (
            <Col sm={6} lg={4} xl={3} key={idx}>
              <CourseCard course={course} />
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default NewestCourses;
