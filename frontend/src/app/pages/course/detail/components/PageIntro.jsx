import { Alert, Col, Container, Row } from "react-bootstrap";
import { BsPatchExclamationFill } from "react-icons/bs";
import { FaClock, FaEdit, FaGlobe, FaSignal, FaStar, FaUserGraduate } from "react-icons/fa";
import pattern4 from "@/assets/images/pattern/04.png";
import { MdLabel } from "react-icons/md";

const PageIntro = ({ course }) => {

  const averageRating = course?.rating?.count > 0 ? (course?.rating?.total || 0) / course?.rating?.count : 0;

  return <section className="bg-blue py-0 py-sm-5 text-white" style={{
    background: `url(${pattern4}) no-repeat center center`,
    backgroundSize: "cover"
  }}>
    <Container>
      <Row className="py-5">
        <Col lg={8}>
          <div className="mb-3 d-flex flex-column flex-sm-row align-items-start gap-2">
            <h6 className="mb-0 bg-primary text-white py-2 px-3 rounded-2 d-inline-block">
              {course?.category?.name ?? "General"}
            </h6>
            {course?.isPrivate && (
              <h6 className="mb-0 bg-danger text-white py-2 px-3 rounded-2 d-inline-block">
                Private
              </h6>
            )}
          </div>
          <h1 className="text-white">{course?.title}</h1>
          <p>{course?.subtitle}</p>
          <ul className="list-inline mb-0">
            <li className="list-inline-item h6 me-3 mb-1 icons-center text-white">
              <FaStar className="text-warning me-2 mb flex-shrink-0" />
              {Number(averageRating).toFixed(1)}/5.0
            </li>
            <li className="list-inline-item h6 me-3 mb-1 icons-center text-white">
              <FaUserGraduate className="text-success me-2 mb flex-shrink-0" />
              {course?.studentsEnrolled ?? "0"} Enrolled
            </li>
            <li className="list-inline-item h6 me-3 mb-1 icons-center text-white">
              <MdLabel size={16} className="text-purple me-2 mb flex-shrink-0" />
              <span className="text-capitalize">{course?.level ?? "all levels"}</span>
            </li>
            <li className="list-inline-item h6 me-3 mb-1 icons-center text-white">
              <FaGlobe className="text-info me-2 mb flex-shrink-0" />
              <span className="text-capitalize">{course?.language ?? "english"}</span>
            </li>
            {course?.createdAt && (
              <li className="list-inline-item h6 me-3 mb-1 icons-center text-white">
                <FaClock className="text-pistachio me-2 mb flex-shrink-0" />
                Created on {new Date(course.updatedAt).toLocaleString("en-GB", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }) || "N/A"}
              </li>
            )}
            {course?.updatedAt && (
              <li className="list-inline-item h6 me-3 mb-1 icons-center text-white">
                <FaEdit className="text-orange me-2 mb flex-shrink-0" />
                Updated on {new Date(course.updatedAt).toLocaleString("en-GB", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }) || "N/A"}
              </li>
            )}
          </ul>
        </Col>
      </Row>
    </Container>
  </section>;
};
export default PageIntro;
