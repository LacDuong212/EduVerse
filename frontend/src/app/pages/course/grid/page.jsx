import PageMetaData from '@/components/PageMetaData';
import Banner from './components/Banner';
import Courses from './components/Courses';

const CoursesPage = () => {
  return <>
      <PageMetaData title="All Courses" />
      <main>
        <Banner />
        <Courses />
      </main>
    </>;
};
export default CoursesPage;