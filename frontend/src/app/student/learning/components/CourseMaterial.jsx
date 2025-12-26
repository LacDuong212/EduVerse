  import {
    Accordion,
    AccordionBody,
    AccordionHeader,
    AccordionItem,
  } from "react-bootstrap";
  import { Fragment } from "react";
  import { useNavigate, useParams } from "react-router-dom";
  import { FaPlay } from "react-icons/fa";
  import { BsCheckCircleFill } from "react-icons/bs";
  import course1 from "@/assets/images/courses/4by3/01.jpg";
  import { secondsToDuration } from "@/utils/duration";

  const CourseMaterial = ({
    title,
    description,
    previewVideo,
    instructor,
    curriculum = [],
    lectureTracking = {},
  }) => {
    const navigate = useNavigate();
    const { courseId } = useParams(); // /student/courses/:courseId

    const goToWatch = (lectureId) => {
      if (!courseId || !lectureId) return;
      navigate(`/courses/${courseId}/watch/${lectureId}`);
    };

    // Lấy state của từng lecture từ map
    const getLectureState = (lecture) => {
      const info = lectureTracking?.[lecture._id] || {};

      // 🔧 Normalize status từ backend / local override
      // Có thể là: "completed", "in_progress", "in-progress", "not_started", ...
      const rawStatus = (info.status || "").toLowerCase();

      let status;
      if (rawStatus === "completed") {
        status = "completed";
      } else if (rawStatus === "in-progress" || rawStatus === "in_progress") {
        status = "in-progress";
      } else {
        // not_started, "", null, undefined...
        status = "not-started";
      }

      const progress =
        typeof info.progress === "number"
          ? Math.min(Math.max(info.progress, 0), 100)
          : 0;

      return { status, progress };
    };

    // UI trạng thái cho từng lecture
    const renderLectureStatus = (lecture) => {
      const { status, progress } = getLectureState(lecture);

      // ✅ Đã hoàn thành → icon check xanh lá
      if (status === "completed") {
        return (
          <BsCheckCircleFill
            className="text-success ms-2 flex-shrink-0"
            size={20}
          />
        );
      }

      // 🔵 Đang học dở (in-progress) → vòng tròn viền xanh, có %
      if (status === "in-progress") {
        return (
          <div
            className="rounded-circle border border-primary text-primary d-flex align-items-center justify-content-center ms-2 flex-shrink-0"
            style={{ width: 32, height: 32, fontSize: "0.75rem" }}
          >
            {Math.round(progress)}%
          </div>
        );
      }

      // ⏺ Chưa bắt đầu → nút Start
      return (
        <button
          type="button"
          className="btn btn-sm btn-outline-primary ms-2 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            goToWatch(lecture._id);
          }}
        >
          Start
        </button>
      );
    };

    // Tính trạng thái cho section dựa trên các lecture con
    const getSectionState = (section) => {
      const lectures = section.lectures || [];
      if (!lectures.length) {
        return { status: "not-started", progress: 0 };
      }

      const states = lectures.map((lec) => getLectureState(lec));
      const total = lectures.length;
      const completedCount = states.filter((s) => s.status === "completed")
        .length;
      const hasInProgress = states.some((s) => s.status === "in-progress");

      if (completedCount === total) {
        return { status: "completed", progress: 100 };
      }

      if (completedCount > 0 || hasInProgress) {
        const roughProgress = Math.round((completedCount / total) * 100);
        return { status: "in-progress", progress: roughProgress };
      }

      return { status: "not-started", progress: 0 };
    };

    // UI trạng thái cho từng section → tag
    const renderSectionStatus = (section) => {
      const { status } = getSectionState(section);

      if (status === "completed") {
        return (
          <span className="badge bg-success ms-2 flex-shrink-0">
            Done
          </span>
        );
      }

      if (status === "in-progress") {
        return (
          <span className="badge bg-primary ms-2 flex-shrink-0">
            In Progress
          </span>
        );
      }

      // not-started
      return (
        <span className="badge bg-secondary ms-2 flex-shrink-0">
          Not Started
        </span>
      );
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
              <div
                className="fw-bold rounded d-flex w-100 align-items-center justify-content-between pe-4"
              >
                {/* Left: thông tin section */}
                <div className="d-flex align-items-center">
                  <span className="me-2">Section {sIdx + 1} - </span>
                  <span className="small">{section.section}</span>
                  <span className="small ms-0 ms-sm-2 d-none d-sm-block">
                    (
                    {Array.isArray(section.lectures)
                      ? section.lectures.length
                      : 0}{" "}
                    lectures)
                  </span>
                </div>

                {/* Right: trạng thái section (tag Done / In Progress / Not Started) */}
                <div className="d-flex align-items-center">
                  {renderSectionStatus(section)}
                </div>
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
                            <li className="nav-item">
                              {secondsToDuration(lecture.duration)}
                            </li>
                          )}

                          {lecture.isFree && (
                            <li className="nav-item text-success">Preview</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Trạng thái lecture (check / vòng tròn % / Start) */}
                    {renderLectureStatus(lecture)}
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
