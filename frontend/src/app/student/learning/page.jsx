import PageMetaData from "@/components/PageMetaData";
import CourseDetail from "./components/CourseDetail";
import Intro from "./components/Intro";
import useLearningCourseDetail from "./useLearningCourse";
import useCourseProgress from "@/hooks/useCourseProgress";
import { useParams } from "react-router-dom";

const LearningCourse = () => {
  const { courseId } = useParams();

  const { course, loading } = useLearningCourseDetail();

  const {
    progress,
    loading: progressLoading,
    error: progressError,
  } = useCourseProgress(courseId);

  return (
    <>
      <PageMetaData title="Course Module" />

      <main>
        {loading && (
          <section className="pt-0">
            <div className="py-5 text-center">
              <div className="spinner-border text-primary" />
            </div>
          </section>
        )}

        {!loading && !course && (
          <section className="pt-0">
            <div className="py-5 text-center text-muted">
              Cannot load course detail.
            </div>
          </section>
        )}

        {!loading && course && (
          <>
            <Intro
              course={course}
              progress={progress}
              progressLoading={progressLoading}
            />

            <CourseDetail
              course={course}
              progress={progress}
              progressError={progressError}
            />

            {progressError && (
              <section className="pt-0">
                <div className="py-2 text-center text-danger small">
                  Cannot load learning progress: {String(progressError)}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </>
  );
};

export default LearningCourse;