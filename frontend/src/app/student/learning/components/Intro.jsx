import { Col, Container, Row } from "react-bootstrap";
import {
  FaGlobe,
  FaRegStar,
  FaStar,
  FaStarHalfAlt,
  FaUserGraduate,
} from "react-icons/fa";

// giống helper trong CourseCard
const clamp = (n, min, max) => Math.max(min, Math.min(max, n ?? 0));

const Intro = ({ course, progress }) => {
  // ------- Fallback dữ liệu từ course -------
  const title = course?.title || "Course title";
  const description =
    course?.subtitle ||
    "This course does not have a description yet.";

  const instructorName = course?.instructor?.name || "Unknown instructor";

  // ⭐️ rating: dùng chung style với CourseCard
  const rawStar =
    typeof course?.rating === "object"
      ? (course?.rating?.average ?? course?.rating?.star)
      : course?.rating;

  const starNum = Number(rawStar);
  const star = Number.isFinite(starNum) ? clamp(starNum, 0, 5) : 0;

  const fullStars = Math.floor(star);
  const hasHalf = Number.isFinite(star) && !Number.isInteger(star);
  const emptyStars = Math.max(0, 5 - Math.ceil(star));

  const ratingCount = Number(
    course?.rating?.count ?? course?.reviewsCount ?? 0
  );

  const language = course?.language || "Unknown language";
  const studentsEnrolled = Number(course?.studentsEnrolled ?? 0);

  // ------- Progress (nếu có) -------
  const totalLessons =
    progress?.totalLessons ??
    course?.lecturesCount ??
    0;
  const completedLessons = progress?.completedLessons ?? 0;

  const progressPercent =
    totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

  return (
    <section className="bg-blue py-7">
      <Container>
        <Row className="justify-content-lg-between">
          {/* LEFT: info course */}
          <Col lg={8}>
            <h1 className="text-white">{title}</h1>

            <p className="text-white">{description}</p>

            <ul className="list-inline mb-5">
              {/* Instructor */}
              <li className="list-inline-item h6 me-4 mb-1 mb-sm-0 text-white">
                <span className="fw-light">By</span> {instructorName}
              </li>

              {/* Rating (copy style từ CourseCard) */}
              <li className="list-inline-item me-4 mb-1 mb-sm-0">
                <ul className="list-inline mb-0">
                  {Array.from({ length: fullStars }).map((_, idx) => (
                    <li
                      key={`f-${idx}`}
                      className="list-inline-item me-1 small"
                    >
                      <FaStar size={14} className="text-warning" />
                    </li>
                  ))}
                  {hasHalf && (
                    <li className="list-inline-item me-1 small">
                      <FaStarHalfAlt size={14} className="text-warning" />
                    </li>
                  )}
                  {Array.from({ length: emptyStars }).map((_, idx) => (
                    <li
                      key={`e-${idx}`}
                      className="list-inline-item me-1 small"
                    >
                      <FaRegStar size={14} className="text-warning" />
                    </li>
                  ))}

                  <li className="list-inline-item ms-2 h6 text-white mb-0">
                    {Number.isFinite(star) ? star.toFixed(1) : "—"}/5.0
                  </li>
                  <li className="list-inline-item text-white mb-0">
                    ({ratingCount.toLocaleString()} reviews)
                  </li>
                </ul>
              </li>

              {/* Language */}
              <li className="list-inline-item h6 mb-0 text-white">
                <FaGlobe className="text-info me-2" />
                {language}
              </li>
            </ul>
          </Col>

          {/* RIGHT: enrolled + progress */}
          <Col lg={3}>
            <h6 className="text-white lead fw-light mb-3">
              <FaUserGraduate className="text-orange me-2" />
              {studentsEnrolled.toLocaleString()} already enrolled
            </h6>

            <button type="button" className="btn btn-warning mb-3 w-100">
              Continue learning
            </button>

            <div className="overflow-hidden mb-4">
              <h6 className="text-white">Your Progress</h6>
              <div className="progress progress-sm bg-white bg-opacity-10 mb-1">
                <div
                  className="progress-bar bg-white aos"
                  role="progressbar"
                  data-aos="slide-right"
                  data-aos-delay={200}
                  data-aos-duration={1000}
                  data-aos-easing="ease-in-out"
                  style={{ width: `${progressPercent}%` }}
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <small className="text-white">
                {completedLessons} of {totalLessons} Completed
              </small>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Intro;
