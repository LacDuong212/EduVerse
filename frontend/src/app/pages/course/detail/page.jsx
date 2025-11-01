import PageMetaData from '@/components/PageMetaData';
import CourseDetails from './components/CourseDetails';
import ListedCourses from './components/ListedCourses';
import PageIntro from './components/PageIntro';
import useCourseDetail from './useCourseDetail';
import TopNavigationBar from '@/components/StudentLayoutComponents/TopNavigationBar';
import Footer from '@/components/Footer';
const CourseDetail = () => {
  const { course, loading, error, refetch } = useCourseDetail();

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

  return <>
      <PageMetaData title="Course Detail" />
      <TopNavigationBar />
      <main>
        <PageIntro course={course} />
        <CourseDetails course={course} />
        <ListedCourses  />
      </main>
      <Footer className="bg-light" />
    </>;
};
export default CourseDetail;
