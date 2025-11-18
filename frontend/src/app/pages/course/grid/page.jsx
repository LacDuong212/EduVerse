import PageMetaData from '@/components/PageMetaData';
import Courses from './components/Courses';

const CoursesPage = () => {
  return <>
      <PageMetaData title="All Courses" />
      <main>
        <Courses />
      </main>
    </>;
};
export default CoursesPage;