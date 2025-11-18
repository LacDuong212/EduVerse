
import PageMetaData from '@/components/PageMetaData';
import Courses from './components/Courses';
import NewsLetter from './components/NewsLetter';
const CoursesPage = () => {
  return <>
      <PageMetaData title="All Courses" />
      <main>
        <Courses />
        <NewsLetter />
      </main>
    </>;
};
export default CoursesPage;
