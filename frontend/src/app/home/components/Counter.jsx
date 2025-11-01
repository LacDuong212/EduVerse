// src/components/Counter.jsx
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Col, Container, Row } from 'react-bootstrap';
import CountUp from 'react-countup';
import {
  FaBookOpen,
  FaUserGraduate,
  FaClock,
  FaChalkboardTeacher
} from 'react-icons/fa';

const Counter = () => {
  // Lấy dữ liệu từ Redux (đã set bởi useHomeCourses + setAllCourses)
  const coursesState = useSelector((s) => s?.courses) || {};
  const newest = Array.isArray(coursesState.newest) ? coursesState.newest : [];
  const bestSellers = Array.isArray(coursesState.bestSellers) ? coursesState.bestSellers : [];
  const topRated = Array.isArray(coursesState.topRated) ? coursesState.topRated : [];
  const biggestDiscounts = Array.isArray(coursesState.biggestDiscounts) ? coursesState.biggestDiscounts : [];
  const allCourses = Array.isArray(coursesState.allCourses) ? coursesState.allCourses : [];

  // Nguồn dữ liệu: Ưu tiên allCourses (đúng tổng DB), nếu chưa có thì gộp 4 list Home
  const sourceCourses = useMemo(() => {
    if (allCourses.length > 0) return allCourses;
    return [...newest, ...bestSellers, ...topRated, ...biggestDiscounts];
  }, [allCourses, newest, bestSellers, topRated, biggestDiscounts]);

  // Unique theo id (hỗ trợ _id / id / courseId)
  const courses = useMemo(() => {
    const map = new Map();
    for (const c of sourceCourses) {
      const id = c?._id ?? c?.id ?? c?.courseId;
      if (!id) continue; // bỏ item rác
      if (!map.has(id)) map.set(id, c);
    }
    return Array.from(map.values());
  }, [sourceCourses]);

  // Tính toán số liệu
  const metrics = useMemo(() => {
    let learners = 0;
    let hours = 0;
    const instructors = new Set();

    for (const c of courses) {
      const s = Number(c?.studentsEnrolled ?? 0);
      if (Number.isFinite(s)) learners += s;

      const d = Number(c?.duration ?? 0);
      if (Number.isFinite(d)) hours += d;

      // Ưu tiên khóa theo instructor.ref, fallback instructor.name
      const key = c?.instructor?.ref ?? c?.instructor?.name ?? null;
      if (key) instructors.add(key);
    }

    return {
      totalCourses: courses.length,
      totalLearners: Math.max(0, learners),
      totalHours: Math.max(0, Math.round(hours)),
      totalInstructors: instructors.size,
    };
  }, [courses]);

  // Dữ liệu hiển thị cho 4 ô counter
  const counterData = [
    { icon: FaBookOpen,          variant: 'primary', count: metrics.totalCourses,     suffix: '',  title: 'Courses' },
    { icon: FaUserGraduate,      variant: 'success', count: metrics.totalLearners,    suffix: '',  title: 'Learners' },
    { icon: FaClock,             variant: 'warning', count: metrics.totalHours,       suffix: 'h', title: 'Total Hours' },
    { icon: FaChalkboardTeacher, variant: 'info',    count: metrics.totalInstructors, suffix: '',  title: 'Instructors' },
  ];

  return (
    <section className="py-0 py-xl-5">
      <Container>
        <Row className="g-4">
          {counterData.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Col sm={6} xl={3} key={idx}>
                <div className={`d-flex justify-content-center align-items-center p-4 bg-${item.variant} bg-opacity-10 rounded-3`}>
                  <span className={`display-6 lh-1 text-${item.variant} mb-0`} aria-hidden>
                    <Icon />
                  </span>
                  <div className="ms-4 h6 fw-normal mb-0">
                    <div className="d-flex">
                      <h5 className="purecounter mb-0 fw-bold">
                        <CountUp
                          delay={0.2}
                          end={Number.isFinite(item.count) ? item.count : 0}
                          suffix={item.suffix}
                          duration={1.2}
                          preserveValue={false}
                        />
                      </h5>
                    </div>
                    <p className="mb-0">{item.title}</p>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      </Container>
    </section>
  );
};

export default Counter;
