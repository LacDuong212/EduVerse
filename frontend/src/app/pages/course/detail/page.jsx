import { Container, Spinner } from "react-bootstrap";
import ErrorState from "@/components/ErrorState";
import NotFoundPage from "@/components/not-found";
import PageMetaData from "@/components/PageMetaData";
import CourseDetails from "./components/CourseDetails";
import PageIntro from "./components/PageIntro";
import RelatedCourses from "./components/RelatedCourses";
import useCourseDetail from "./useCourseDetail";

const CourseDetail = () => {
  const {
    course,
    relatedCourses,
    loading,
    error,
    statusCode,
    handleAddToCart,
    isOwned,
    refetch,
  } = useCourseDetail();

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

  if (statusCode === 404) return <NotFoundPage />;

  if (error)
    return <ErrorState
      messages={[
        "Course is pulling a no-show 🏃‍♂️💨",
        "Database failed the entrance exam 📝❌",
        "Server stayed up too late studying 🧠🌫️",
        "Digital ink spill on the syllabus! 🖋️🐙",
        "Course checked out indefinitely 📚🚶‍♂️"
      ]}
      showReturn
      onRetry={refetch}
    />;

  return (
    <>
      <PageMetaData title="Course Details" />
      <main>
        <PageIntro course={course} />
        <CourseDetails
          course={course}
          owned={isOwned}
          onAddToCart={handleAddToCart}
        />
        <RelatedCourses relatedCourses={relatedCourses} />
      </main>
    </>
  );
};

export default CourseDetail;