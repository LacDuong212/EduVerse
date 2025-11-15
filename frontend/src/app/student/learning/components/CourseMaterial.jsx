import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
} from "react-bootstrap";
import { Fragment } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import course1 from "@/assets/images/courses/4by3/01.jpg";

// Props nhận từ CourseDetail:
// - title, description, previewVideo, instructor (tuỳ bạn dùng trong header nếu muốn)
// - curriculum: [{ section, lectures: [{ _id, title, videoUrl, duration, isFree }] }]
const CourseMaterial = ({
  title,
  description,
  previewVideo,
  instructor,
  curriculum = [],
}) => {
  const navigate = useNavigate();
  const { courseId } = useParams(); // /student/courses/:courseId

  const goToWatch = (lectureId) => {
    if (!courseId || !lectureId) return;
    navigate(`/courses/${courseId}/watch/${lectureId}`);
  };

  // fallback nếu không có curriculum
  if (!Array.isArray(curriculum) || curriculum.length === 0) {
    return (
      <p className="text-muted mb-0">
        This course does not have any published curriculum yet.
      </p>
    );
  }

  return (
    <Accordion
      defaultActiveKey="0"
      className="accordion-icon accordion-border"
      id="accordionExample2"
    >
      {curriculum.map((section, sIdx) => (
        <AccordionItem
          eventKey={`${sIdx}`}
          className="mb-3"
          key={section._id || sIdx}
        >
          <AccordionHeader as="h6" className="font-base">
            <div className="fw-bold rounded d-flex collapsed w-100">
              {/* Tiêu đề section */}
              <span className="me-2">Section {sIdx + 1} - </span>
              <span className="small">{section.section}</span>

              {/* Số lecture trong section */}
              <span className="small ms-0 ms-sm-2 d-none d-sm-block">
                (
                {Array.isArray(section.lectures)
                  ? section.lectures.length
                  : 0}{" "}
                lectures)
              </span>
            </div>
          </AccordionHeader>

          <AccordionBody className="mt-3">
            {(section.lectures || []).map((lecture, lIdx) => (
              <Fragment key={lecture._id || lIdx}>

                {/* 🔥 toàn bộ dòng lecture click được */}
                <div
                  className="d-flex justify-content-between align-items-center py-2 px-1"
                  style={{ cursor: "pointer" }}
                  onClick={() => goToWatch(lecture._id)}
                >
                  <div className="d-flex align-items-center">

                    {/* Thumbnail */}
                    <div className="icon-md position-relative">
                      <img
                        src={course1}
                        className="rounded-1"
                        alt="lecture thumbnail"
                      />
                      <small className="text-white position-absolute top-50 start-50 translate-middle">
                        <FaPlay className="me-0" />
                      </small>
                    </div>

                    {/* Info */}
                    <div className="ms-3">
                      <span className="d-inline-block text-truncate mb-0 h6 fw-normal w-100px w-sm-200px w-md-400px">
                        {lecture.title || "Untitled lecture"}
                      </span>

                      <ul className="nav nav-divider small mb-0">
                        <li className="nav-item">Video</li>

                        {lecture.duration != null && (
                          <li className="nav-item">{Math.round(lecture.duration)} min</li>
                        )}

                        {lecture.isFree && (
                          <li className="nav-item text-success">Preview</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                {(section.lectures?.length || 0) - 1 !== lIdx && <hr />}
              </Fragment>
            ))}


          </AccordionBody>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default CourseMaterial;
