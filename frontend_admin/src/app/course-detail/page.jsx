import { Container, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

import ErrorState from "@/components/ErrorState";
import NotFoundPage from "@/app/not-found";
import PageMetaData from "@/components/PageMetaData";
import CourseDetails from "./components/CourseDetails";
import PageIntro from "./components/PageIntro";
import useCourseDetail from "./useCourseDetail";

const CourseDetail = () => {
  const navigate = useNavigate();

  const { course, loading, error, statusCode, refetch } = useCourseDetail();

  if (loading) {
    return (
      <Container className="position-absolute top-50 start-50 translate-middle d-flex flex-column align-items-center justify-content-center">
        <Spinner
          animation="border"
          variant="primary"
          style={{ width: "30px", height: "30px" }}
        />
      </Container>
    );
  }

  if (statusCode === 404) {
    return <NotFoundPage />;
  }

  if (error) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center w-100"
        style={{ minHeight: "calc(100vh - 200px)" }}
      >
        <ErrorState
          className="d-flex flex-column align-items-center justify-content-center gap-3"
          message={error}
          showReturn
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <>
      <PageMetaData title={course?.title || "Course Details"} />

      <main>
        <div className="border-bottom pt-1 pb-2">
          <button
            type="button"
            className="btn btn-link p-0 text-decoration-none d-inline-flex align-items-center fw-semibold text-primary"
            onClick={() => navigate(-1)}
          >
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-circle border me-2"
              style={{ width: 32, height: 32 }}
            >
              <FaArrowLeft size={13} />
            </span>
            Back to courses
          </button>
        </div>

        <PageIntro course={course} />
        <CourseDetails course={course} />
      </main>
    </>
  );
};

export default CourseDetail;