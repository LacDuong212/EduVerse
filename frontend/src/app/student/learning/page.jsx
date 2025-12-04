import PageMetaData from "@/components/PageMetaData";
import CourseDetail from "./components/CourseDetail";
import Intro from "./components/Intro";
import useLearningCourseDetail from "./useLearningCourse";
import useCourseProgress from "@/hooks/useCourseProgress"; // ✅ hook progress
import { useParams } from "react-router-dom";

const LearningCourse = () => {
  const { courseId } = useParams(); // /student/courses/:courseId

  const { course, loading } = useLearningCourseDetail();

  // ✅ Lấy progress theo courseId từ URL
  const {
    progress,
    loading: progressLoading,
    error: progressError,
  } = useCourseProgress(courseId);

  return (
    <>
      <PageMetaData title="Course Module" />
      <main>
        {/* Loading course (progressLoading không chặn UI) */}
        {loading && (
          <section className="pt-0">
            <div className="py-5 text-center">
              <div className="spinner-border text-primary" />
            </div>
          </section>
        )}

        {/* Course lỗi hoặc không tồn tại */}
        {!loading && !course && (
          <section className="pt-0">
            <div className="py-5 text-center text-muted">
              Cannot load course detail.
            </div>
          </section>
        )}

        {/* Course OK */}
        {!loading && course && (
          <>
            {/* ✅ Intro: truyền đúng progress để Continue + Your Progress hoạt động */}
            <Intro course={course} progress={progress} />

            {/* Có thể truyền thêm progress xuống đây nếu sau này cần */}
            <CourseDetail course={course} />
            {/* hoặc: <CourseDetail course={course} progress={progress} /> nếu bạn sửa CourseDetail nhận prop */}
            
            {/* (optional) debug lỗi progress */}
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
