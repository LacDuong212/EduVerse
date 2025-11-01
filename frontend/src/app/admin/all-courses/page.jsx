import PageMetaData from '@/components/PageMetaData';
import Courses from './components/Courses';
import CoursesStat from './components/CoursesStat';
const Courses = () => {
  return <>
      <PageMetaData title="All Course" />
      <CoursesStat />
      <Courses />
    </>;
};
export default Courses;
