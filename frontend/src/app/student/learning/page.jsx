import PageMetaData from '@/components/PageMetaData';
import CourseDetail from './components/CourseDetail';
import Intro from './components/Intro';
import useLearningCourseDetail from './useLearningCourse';

const LearningCourse = () => {
  const { course, loading } = useLearningCourseDetail();

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
            {/* ✅ Intro có dữ liệu course */}
            <Intro course={course} progress={null} />

            {/* ✅ CourseDetail cũng nhận course để render materials/discussion */}
            <CourseDetail course={course} />
          </>
        )}
      </main>
    </>
  );
};

export default LearningCourse;
