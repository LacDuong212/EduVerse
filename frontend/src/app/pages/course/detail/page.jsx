import PageMetaData from '@/components/PageMetaData';
import CourseDetails from './components/CourseDetails';
import ListedCourses from './components/ListedCourses';
import PageIntro from './components/PageIntro';
import useCourseDetail from './useCourseDetail';

const CourseDetail = () => {
  const {
    course,
    loading,
    error,
    refetch,
    owned,            // 🔹 lấy thêm từ hook
    handleAddToCart,  // 🔹 lấy thêm từ hook
  } = useCourseDetail();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        <h1>Error loading course</h1>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <PageMetaData title="Course Detail" />
      <main>
        <PageIntro course={course} />
        {/* 🔹 truyền thêm owned + onAddToCart cho CourseDetails */}
        <CourseDetails
          course={course}
          owned={owned}
          onAddToCart={handleAddToCart}
        />
        <ListedCourses />
      </main>
    </>
  );
};

export default CourseDetail;
