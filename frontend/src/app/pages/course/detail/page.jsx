import Footer from '@/components/Footer';
import PageMetaData from '@/components/PageMetaData';
import CourseDetails from './components/CourseDetails';
import ListedCourses from './components/ListedCourses';
import PageIntro from './components/PageIntro';
import TopNavigationBar from './components/TopNavigationBar';
const CourseDetail = () => {
  return <>
      <PageMetaData title="Course Detail" />
      <TopNavigationBar />
      <main>
        <PageIntro />
        <CourseDetails />
        <ListedCourses />
      </main>
      <Footer className="bg-light" />
    </>;
};
export default CourseDetail;
