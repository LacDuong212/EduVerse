import { Container, Spinner } from "react-bootstrap";
import ErrorState from "@/components/ErrorState";
import NotFoundPage from "@/components/not-found";
import PageMetaData from "@/components/PageMetaData";
import CourseDetails from "./components/CourseDetails";
import CourseBlockedNotice from "./components/CourseBlockedNotice";
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
    blockedInfo,

    refundStatus,
    refundLoading,
    handleClaimRefund,

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

  if (blockedInfo?.isBlocked) {
    return (
      <>
        <PageMetaData title="Course Blocked" />
        <CourseBlockedNotice
          blockedInfo={blockedInfo}
          refundStatus={refundStatus}
          refundLoading={refundLoading}
          onClaimRefund={handleClaimRefund}
        />
      </>
    );
  }

  if (statusCode === 404) return <NotFoundPage />;

  if (error)
    return (
      <div className="d-flex flex-column align-items-center justify-content-center w-100" style={{ minHeight: "calc(100vh - 200px)" }}>
        <ErrorState
          className="d-flex flex-column align-items-center justify-content-center gap-3"
          message={error}
          showReturn
          onRetry={refetch}
        />
      </div>
    );

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