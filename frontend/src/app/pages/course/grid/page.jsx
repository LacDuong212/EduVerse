
import PageMetaData from '@/components/PageMetaData';
import Courses from './components/Courses';
import NewsLetter from './components/NewsLetter';
import PageBanner from './components/PageBanner';
// import TopNavigationBar from './components/TopNavigationBar';
const CoursesPage = () => {
  return <>
      <PageMetaData title="All Courses" />
      {/* <TopNavigationBar /> */}
      <main>
        {/* <PageBanner /> */}
        <Courses />
        <NewsLetter />
   
      </main>
    </>;
};
export default CoursesPage;
