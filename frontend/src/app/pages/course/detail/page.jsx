import { Container } from "react-bootstrap";
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
      <Container className="d-flex flex-column align-items-center justify-content-center my-5">
        <h3>Loading...</h3>
      </Container>
    );
  }

  if (statusCode === 404) return <NotFoundPage />;

  if (error) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center my-5">
        <h3>Error loading course</h3>
        <button onClick={refetch} className="btn btn-primary">Retry</button>
      </Container>
    );
  }

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